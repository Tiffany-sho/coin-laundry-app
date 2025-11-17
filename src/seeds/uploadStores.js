import { createClient } from "@supabase/supabase-js";
import stores from "./store.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase URLまたはService Keyが .env.local に設定されていません。"
  );
}
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const storesToUpload = stores.map((store) => ({
  id: store.id,
  store: store.store,
  location: store.location,
  description: store.description,
  machines: store.machines,
  images: store.images,
  owner: store.owner,
}));

const machinesState = stores.map((store) => {
  const newObj = store.machines.map((machine) => {
    return {
      id: machine.id,
      name: machine.name,
      break: false,
      comment: "",
    };
  });
  return {
    laundryId: store.id,
    laundryName: store.name,
    detergent: 0,
    softener: 0,
    machines: newObj,
    stocker: store.owner,
  };
});

const uploadData = async () => {
  console.log("アップロードを開始します...");

  try {
    console.log("既存のデモデータを削除中...");
    const { error: deleteError } = await supabase
      .from("laundry_store")
      .delete()
      .eq("owner", "c21ed2db-5903-4ad9-99db-c42d72a352a0"); //

    if (deleteError) {
      console.error("削除エラー:", deleteError.message);
      throw deleteError;
    }

    console.log("新しいデータを挿入中...");
    const { data, error: insertError } = await supabase
      .from("laundry_store")
      .insert(storesToUpload)
      .select();

    if (insertError) {
      console.error("挿入エラー:", insertError.message);
      throw insertError;
    }

    const { error: stockError } = await supabase
      .from("laundry_state")
      .insert(machinesState);

    if (stockError) {
      console.error("挿入エラー2:", stockError.message);
      throw stockError;
    }

    console.log(
      `\nアップロード成功！ ${data.length} 件のデータが挿入されました。`
    );
  } catch (error) {
    console.error("\n処理が失敗しました。", error.message);
  }
};

uploadData();
