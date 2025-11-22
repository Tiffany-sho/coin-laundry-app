"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "../user/action";

export async function getStores() {
  const { user } = await getUser();
  if (!user) {
    return {
      error: { msg: "ログインしてください", status: 401 },
    };
  }
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("laundry_store")
      .select("*")
      .eq("owner", user.id);

    if (error) {
      return {
        error: { msg: "データの取得に失敗しました", status: 500 },
      };
    }

    return { data: data };
  } catch (err) {
    return {
      error: { msg: "予期しないエラーが発生しました", status: 400 },
    };
  }
}

export async function getStore(id) {
  const { user } = await getUser();
  if (!user) {
    return {
      error: { msg: "ログインしてください", status: 401 },
    };
  }
  const supabase = await createClient();
  try {
    const { data: coinLaundryStore, error } = await supabase
      .from("laundry_store")
      .select("*")
      .eq("owner", user.id)
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return {
        error: { msg: "データの取得に失敗しました", status: 500 },
      };
    }

    return { data: coinLaundryStore };
  } catch (err) {
    return {
      error: { msg: "予期しないエラーが発生しました", status: 400 },
    };
  }
}

export async function createStore(formData) {
  const supabase = await createClient();
  const { user } = await getUser();

  if (!user) {
    return { error: "ユーザーが認証されていません。" };
  }
  const machinesString = formData.get("machines");
  const imagesString = formData.get("images");

  const machinesData = machinesString ? JSON.parse(machinesString) : [];
  const imagesData = imagesString ? JSON.parse(imagesString) : [];
  try {
    const { data, error: storeError } = await supabase
      .from("laundry_store")
      .insert({
        store: formData.get("store"),
        location: formData.get("location"),
        description: formData.get("description"),
        machines: machinesData,
        images: imagesData,
        owner: user.id,
      })
      .select("id,machines,store,owner")
      .single();

    if (storeError) {
      return { error: "店舗登録に失敗しました" };
    }
    const machinesState = data.machines.map((machine) => {
      const newObj = {
        id: machine.id,
        name: machine.name,
        break: false,
        comment: "",
      };
      return newObj;
    });

    const { error: stockError } = await supabase.from("laundry_state").insert({
      laundryId: data.id,
      laundryName: data.store,
      detergent: 0,
      softener: 0,
      machines: machinesState,
      stocker: data.owner,
    });

    if (stockError) {
      return { error: "在庫情報の登録に失敗しました" };
    }

    return { data: data };
  } catch (err) {
    return {
      error: { msg: "予期しないエラーが発生しました", status: 400 },
    };
  }
}

export async function updateStore(formData, id) {
  const { user } = await getUser();

  if (!user) {
    return { error: "ユーザーが認証されていません。" };
  }

  const supabase = await createClient();
  const machinesString = formData.get("machines");
  const imagesString = formData.get("images");

  const machinesData = machinesString ? JSON.parse(machinesString) : [];
  const imagesData = imagesString ? JSON.parse(imagesString) : [];
  try {
    const { data, error } = await supabase
      .from("laundry_store")
      .update({
        store: formData.get("store"),
        location: formData.get("location"),
        description: formData.get("description"),
        machines: machinesData,
        images: imagesData,
      })
      .eq("owner", user.id)
      .eq("id", id)
      .select("id, store ,machines ,owner")
      .single();

    if (error) {
      return { error: "店舗情報の更新に失敗しました" };
    }

    const machinesState = data.machines.map((machine) => {
      const newObj = {
        id: machine.id,
        name: machine.name,
        break: machine.break || false,
        comment: "",
      };
      return newObj;
    });

    const { error: stockError } = await supabase
      .from("laundry_state")
      .update({
        laundryName: data.store,
        machines: machinesState,
      })
      .eq("stocker", data.owner)
      .eq("laundryId", data.id);

    if (stockError) {
      return { error: "設備状況編集に失敗しました" };
    }

    const { error: fundsError } = await supabase
      .from("collect_funds")
      .update({
        laundryName: data.store,
      })
      .eq("collecter", data.owner)
      .eq("laundryId", data.id);

    if (fundsError) {
      return { error: "集金データの編集に失敗しました" };
    }
    return { data: data };
  } catch (err) {
    return {
      error: { msg: "予期しないエラーが発生しました", status: 400 },
    };
  }
}

export async function deleteStore(id) {
  const { user } = await getUser();

  if (!user) {
    return { error: "ユーザーが認証されていません。" };
  }
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("laundry_store")
      .delete()
      .eq("owner", user.id)
      .eq("id", id)
      .select(" store , images")
      .single();

    if (error) {
      return { error: "店舗情報の削除に失敗しました" };
    }

    Promise.all(data.images.map((imageFile) => deleteImage(imageFile.path)))
      .then(() => console.log("Old images cleaned up."))
      .catch((err) => console.error("Cleanup deletion failed:", err));

    return { data: data };
  } catch (err) {
    return {
      error: { msg: "予期しないエラーが発生しました", status: 400 },
    };
  }
}

const deleteImage = async (filePath) => {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("Laundry-Images")
    .remove([`laundry/${filePath}`]);

  if (error) {
    return false;
  }
  if (data.length === 0) {
    return false;
  }
  return true;
};
