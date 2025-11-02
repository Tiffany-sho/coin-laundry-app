"use client";

import { FileUpload } from "@chakra-ui/react";
import { LuFileImage, LuX } from "react-icons/lu";
import { useCoinLaundryForm } from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";
import styles from "./UploadPicture.module.css";

const FileUploadList = () => {
  const { state, dispatch } = useCoinLaundryForm();
  const deleteAction = (removeFileItem) => {
    dispatch({ type: "REMOVE_PICTURE", payload: { removeFileItem } });
  };

  if (state.newPictures.length === 0) return null;

  return (
    <div className={styles.imageGrid}>
      {state.newPictures.map((item) => (
        <div key={item.id} className={styles.imageItem}>
          <img src={item.url} alt="アップロード画像" />
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => deleteAction(item)}
          >
            <LuX />
          </button>
        </div>
      ))}
    </div>
  );
};

const UploadPicture = () => {
  const { dispatch } = useCoinLaundryForm();

  const changeHander = (e) => {
    const file = e.acceptedFiles[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    const newFileItem = {
      id: crypto.randomUUID(),
      url: fileUrl,
      file: file,
    };

    dispatch({ type: "ADD_NEW_PICTURE", payload: { newFileItem } });
  };

  return (
    <div className={styles.uploadContainer}>
      <FileUpload.Root accept="image/*" onFileChange={changeHander}>
        <div className={styles.uploadSection}>
          <FileUpload.HiddenInput />
          <FileUpload.Trigger asChild>
            <button type="button" className={styles.uploadButton}>
              <LuFileImage />
              画像をアップロード
            </button>
          </FileUpload.Trigger>
          <FileUploadList />
        </div>
      </FileUpload.Root>
    </div>
  );
};

export default UploadPicture;
