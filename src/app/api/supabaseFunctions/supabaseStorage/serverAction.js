"use server";

import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../supabaseDatabase/user/action";

export const uploadStoreImage = async (formData) => {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const file = formData.get("file");
  const filename = formData.get("filename");

  if (!file || !filename) return { error: "ファイルが不正です" };

  const supabase = createServiceClient();
  const { error } = await supabase.storage
    .from("Laundry-Images")
    .upload(`laundry/${filename}`, file, { contentType: file.type });

  if (error) {
    console.error("Storage upload error:", error);
    return { error: `画像アップロードエラー: ${error.message} (${error.statusCode ?? error.error ?? ""})` };
  }

  const { data } = supabase.storage
    .from("Laundry-Images")
    .getPublicUrl(`laundry/${filename}`);

  return { url: data.publicUrl };
};

export const deleteStoreImage = async (filePath) => {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from("Laundry-Images")
    .remove([`laundry/${filePath}`]);

  if (error || data?.length === 0) return { error: "画像の削除に失敗しました" };
  return {};
};
