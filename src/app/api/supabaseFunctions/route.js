import { createClient } from "@/utils/supabase/client";

const BACKET_NAME = process.env.NEXT_PUBLIC_BACKET_NAME;

const supabase = createClient();

export const uploadImage = async (filename, file) => {
  const { error } = await supabase.storage
    .from(BACKET_NAME)
    .upload(`laundry/${filename}`, file);

  if (error) {
    console.error("Error uploading user card:", error);
    throw new Error("Failed to upload user card");
  }
};

export const getImage = (filename) => {
  const { data } = supabase.storage
    .from(BACKET_NAME)
    .getPublicUrl(`laundry/${filename}`);

  return data;
};

export const deleteImage = async (filePath) => {
  const { data, error } = await supabase.storage
    .from(BACKET_NAME)
    .remove([`laundry/${filePath}`]);

  console.log(`laundry/${filePath}`);
  console.log(error);
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
