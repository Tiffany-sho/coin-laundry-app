"use client";
import { redirect } from "next/navigation";
import {
  uploadStoreImage,
  deleteStoreImage,
} from "@/app/api/supabaseFunctions/supabaseStorage/serverAction";
import { getImage } from "@/app/api/supabaseFunctions/supabaseStorage/action";
import {
  createStore,
  updateStore,
} from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { createMessage } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";
import { useCoinLaundryForm } from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";
import { showToast } from "@/functions/makeToast/toast";

export function useStoreSubmit({ storeId, images, method, formRef, dialogRef }) {
  const { state, dispatch } = useCoinLaundryForm();

  const postHander = async () => {
    dispatch({ type: "SET_ISLOADING", payload: true });
    dispatch({ type: "SET_MSG", payload: "" });

    const formData = new FormData(formRef.current);

    const newMachine = state.machines
      .filter((machine) => machine.num > 0)
      .map((machine) => ({ ...machine, id: crypto.randomUUID() }));

    const filesToUpload = state.newPictures.filter((item) => item.file);

    if (filesToUpload.length > 0) {
      const invalidFiles = filesToUpload.some(
        (item) =>
          item.file.type !== "image/jpeg" && item.file.type !== "image/png"
      );
      if (invalidFiles) {
        dispatch({ type: "SET_MSG", payload: "jpeg/pngファイルを選択してください" });
        dispatch({ type: "SET_ISLOADING", payload: false });
        return;
      }
    }

    let newImageObjects = [];

    if (filesToUpload.length > 0) {
      try {
        const uploadPromises = filesToUpload.map((item) => {
          const fileName = `${Date.now()}_${item.file.name}`;
          return (async () => {
            const fd = new FormData();
            fd.append("file", item.file);
            fd.append("filename", fileName);
            const { url, error } = await uploadStoreImage(fd);
            if (error) throw new Error(error);
            const imageData = getImage(fileName);
            return { path: fileName, url: url ?? imageData.publicUrl };
          })();
        });
        newImageObjects = await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Upload failed:", error);
        dispatch({ type: "SET_MSG", payload: "画像のアップロード中にエラーが発生しました" });
        dispatch({ type: "SET_ISLOADING", payload: false });
        return;
      }
    }

    const finalImageUrlList = [...state.existingPictures, ...newImageObjects];

    formData.append("machines", JSON.stringify(newMachine));
    formData.append("images", JSON.stringify(finalImageUrlList));

    let responseData;

    try {
      if (state.store === "" || state.location === "" || state.description === "") {
        throw new Error("空のフォームデータがあります。");
      }
      if (method === "POST") {
        const { data, error } = await createStore(formData);
        if (error) throw new Error("ストアの作成に失敗しました");
        responseData = data;
      } else if (method === "PUT") {
        const { data, error } = await updateStore(formData, storeId);
        if (error) {
          console.log(error);
          throw new Error("ストアの編集に失敗しました");
        }
        responseData = data;
      }
    } catch (error) {
      console.error("API Error:", error);
      const msg = error.message || "データの送信に失敗しました。";
      dispatch({ type: "SET_MSG", payload: msg });
      showToast("error", method === "POST" ? "店舗の登録に失敗しました" : "店舗の編集に失敗しました");
      dispatch({ type: "SET_ISLOADING", payload: false });
      if (dialogRef.current) dialogRef.current.click();

      if (newImageObjects.length > 0) {
        Promise.all(newImageObjects.map((img) => deleteStoreImage(img.path))).catch(
          (err) => console.error("Rollback delete failed:", err)
        );
      }
      return;
    }

    const finalImagePaths = new Set(finalImageUrlList.map((img) => img.path));
    const pathsToDelete = images
      .map((img) => img.path)
      .filter((path) => !finalImagePaths.has(path));

    if (pathsToDelete.length > 0) {
      Promise.all(pathsToDelete.map((path) => deleteStoreImage(path)))
        .then(() => console.log("Old images cleaned up."))
        .catch((err) => console.error("Cleanup deletion failed:", err));
    }

    sessionStorage.setItem(
      "toast",
      JSON.stringify({
        description: `${responseData.store}店の${method === "POST" ? "登録" : "編集"}が完了しました。`,
        type: "success",
        closable: true,
      })
    );

    const { error } = await createMessage(
      `${responseData.store}店の${method === "POST" ? "登録" : "編集"}が完了しました。`
    );
    if (error) console.log("メッセージアクションにエラーが発生しました");

    setTimeout(() => {
      dispatch({ type: "SET_ISLOADING", payload: false });
    }, 10000);
    redirect(`/coinLaundry/${responseData.id}`);
  };

  return { postHander };
}
