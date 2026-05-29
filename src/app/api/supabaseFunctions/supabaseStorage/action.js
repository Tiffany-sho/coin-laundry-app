import { createClient } from "@/utils/supabase/client";

export const uploadAvatar = async (file) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインしてください");

  const ext = file.name.split(".").pop().toLowerCase();
  const path = `avatars/${user.id}.${ext}`;

  const { error } = await supabase.storage
    .from("Laundry-Images")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error("アバターのアップロードに失敗しました");

  const { data } = supabase.storage
    .from("Laundry-Images")
    .getPublicUrl(path);

  return data.publicUrl;
};

export const uploadImage = async (filename, file) => {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from("Laundry-Images")
    .upload(`laundry/${filename}`, file);

  if (error) {
    console.error("Error uploading user card:", error);
    throw new Error("Failed to upload user card");
  }
};

export const getImage = (filename) => {
  const supabase = createClient();
  const { data } = supabase.storage
    .from("Laundry-Images")
    .getPublicUrl(`laundry/${filename}`);

  return data;
};

export const deleteImage = async (filePath) => {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("Laundry-Images")
    .remove([`laundry/${filePath}`]);

  if (error) {
    return false;
  }
  if (data.length === 0) {
    console.error("Error deleting file:");
    return false;
  }
  return true;
};
