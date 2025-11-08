"use server";

import { createClient } from "@/utils/supabase/server";

const BACKET_NAME = process.env.NEXT_PUBLIC_BACKET_NAME;

export async function createStore(formData) {
  const supabase = await createClient();

  const machinesString = formData.get("machines");
  const imagesString = formData.get("images");

  const machinesData = machinesString ? JSON.parse(machinesString) : [];
  const imagesData = imagesString ? JSON.parse(imagesString) : [];

  const { data, error } = await supabase
    .from("laundry_store")
    .insert({
      store: formData.get("store"),
      location: formData.get("location"),
      description: formData.get("description"),
      machines: machinesData,
      images: imagesData,
    })
    .select("id, store")
    .single();

  if (error) {
    return { error: error.message };
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
    .select("id, store")
    .single();

  if (error) {
    return { error: error.message };
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
    .from(BACKET_NAME)
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
