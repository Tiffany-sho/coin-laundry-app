"use server";

import { createClient } from "@/utils/supabase/server";

export async function createStore(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ユーザーが認証されていません。" };
  }
  const machinesString = formData.get("machines");
  const imagesString = formData.get("images");

  const machinesData = machinesString ? JSON.parse(machinesString) : [];
  const imagesData = imagesString ? JSON.parse(imagesString) : [];

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
    return { error: storeError.message };
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
    return { error: stockError.message };
  }

  return { data: data };
}

export async function updateStore(formData, id) {
  const supabase = await createClient();
  const machinesString = formData.get("machines");
  const imagesString = formData.get("images");

  const machinesData = machinesString ? JSON.parse(machinesString) : [];
  const imagesData = imagesString ? JSON.parse(imagesString) : [];

  const { data, error } = await supabase
    .from("laundry_store")
    .update({
      store: formData.get("store"),
      location: formData.get("location"),
      description: formData.get("description"),
      machines: machinesData,
      images: imagesData,
    })
    .eq("id", id)
    .select("id, store ,machines ,owner")
    .single();

  if (error) {
    return { error: error.message };
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
    .eq("stocker", data.owner);

  if (stockError) {
    return { error: stockError.message };
  }

  return { data: data };
}

export async function deleteStore(id) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("laundry_store")
    .delete()
    .eq("id", id)
    .select("id, store , images")
    .single();

  if (error) {
    return { error: error.message };
  }

  Promise.all(data.images.map((imageFile) => deleteImage(imageFile.path)))
    .then(() => console.log("Old images cleaned up."))
    .catch((err) => console.error("Cleanup deletion failed:", err));

  return { data: data };
}

const deleteImage = async (filePath) => {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("Laundry-Images")
    .remove([`laundry/${filePath}`]);

  if (error) {
    console.error("Error deleting file:", error.message);
    return false;
  }
  if (data.length === 0) {
    console.error("Error deleting file:");
    return false;
  }
  return true;
};
