import { createClient } from "@supabase/supabase-js";
import { coinData } from "./coinData.js";
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

const coinDataToUpload = coinData.map((item) => ({
  laundryName: item.laundryName,
  laundryId: item.laundryId,
  date: item.date,
  fundsArray: item.fundsArray,
  totalFunds: item.totalFunds,
  collecter: item.collecter,
}));

const uploadData = async () => {
  console.log("アップロードを開始します...");

  try {
    // console.log("既存のデモデータを削除中...");
    // const { error: deleteError } = await supabase
    //   .from("collect_funds")
    //   .delete()
    //   .eq("collecter", "699f360f-d50e-46a0-bf10-38d96216a752"); //

    // if (deleteError) {
    //   console.error("削除エラー:", deleteError.message);
    //   throw deleteError;
    // }

    console.log("新しいデータを挿入中...");
    const { data, error: insertError } = await supabase
      .from("collect_funds")
      .insert(coinDataToUpload)
      .select();

    if (insertError) {
      console.error("挿入エラー:", insertError.message);
      throw insertError;
    }

    console.log(
      `\nアップロード成功！ ${data.length} 件のデータが挿入されました。`
    );
  } catch (error) {
    console.error("\n処理が失敗しました。", error.message);
  }
};

uploadData();
