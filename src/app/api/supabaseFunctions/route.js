import { supabase } from "@/lib/supabase";

const BACKET_NAME = process.env.NEXT_PUBLIC_BACKET_NAME;

export const uploadImage = async (filename, file) => {
  const { error } = await supabase.storage
    .from(BACKET_NAME)
    .upload(`public/${filename}`, file);

  if (error) {
    console.error("Error uploading user card:", error);
    console.log(filename);
    throw new Error("Failed to upload user card");
  }
};

export const getImage = (filename) => {
  const { data } = supabase.storage
    .from(BACKET_NAME)
    .getPublicUrl(`public/${filename}`);

  return data;
};

export const deleteImage = async (filePath) => {
  const { error } = await supabase.storage
    .from(BACKET_NAME)
    .remove([`public/${filePath}`]);

  if (error) {
    console.error("Error deleting file:", error.message);
    return false;
  }

  return true;
};
