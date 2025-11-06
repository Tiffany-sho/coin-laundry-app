// import { mongoose } from "mongoose";
// import stores from "./store.js";
// import CoinLaundryStore from "../models/coinLaundryStore.js";
// import CollectMoney from "../models/collectMoney.js";

// const MONGODB_URL = "mongodb://localhost:27017/Coin-Laundry";
// console.log(MONGODB_URL);
// mongoose
//   .connect(MONGODB_URL)

//   .then(() => {
//     console.log("MongDB接続しました");
//   })
//   .catch((err) => {
//     console.log("MongDB接続できませんでした");
//     console.log(err);
//   });

// const seedDB = async () => {
//   await CoinLaundryStore.deleteMany({});
//   await CollectMoney.deleteMany({});

//   for (let i = 0; i < stores.length; i++) {
//     const newCoinlaundryStore = new CoinLaundryStore(stores[i]);
//     await newCoinlaundryStore.save();
//   }
// };

// seedDB().then(() => {
//   mongoose.connection.close();
// });
"use server";
import { createServerClient } from "@supabase/ssr";
import stores from "./store.js";
import { cookies } from "next/headers.js"; // ⬅️ 1. cookies をインポートする

async function createClient() {
  const cookieStore = cookies(); // ⬅️ インポートしたので関数が正しく呼ばれる

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            console.log("サーバ接続失敗");
          }
        },
      },
    }
  );
}

async function createStore(store) {
  const supabase = await createClient();

  // ⬇️ 2. キー名を store.js と Supabaseテーブルに合わせる
  const { error } = await supabase.from("laundry_store").insert({
    store_name: store.store_name, // 修正: store -> store_name
    location: store.location,
    description: store.description,
    machines: store.machines, // 修正: machinesData -> machines
    images: store.images, // 修正: imagesData -> images
    owner_id: store.owner, // 修正: owner -> owner_id (Supabaseの推奨カラム名)
  });

  if (error) {
    console.error("Insert Error:", error.message); // ⬅️ 詳細なエラーを見る
    return { error: error.message };
  }
}

async function deleteStore() {
  const supabase = await createClient();

  // ⬇️ 3. RLSを通過するために、削除する owner を指定する
  // (store.js の 'owner' IDで全て削除する場合)
  const ownerIdToDelete = "699f360f-d50e-46a0-bf10-38d96216a752";

  // どの行を削除するかの条件 (.eq()) が必須です
  const { error } = await supabase
    .from("laundry_store")
    .delete()
    .eq("owner_id", ownerIdToDelete); // ⬅️ 'owner_id' がこのIDの行を全て削除

  if (error) {
    console.error("Delete Error:", error.message); // ⬅️ 詳細なエラーを見る
    return { error: error.message };
  }
}

const resetStore = async () => {
  console.log(process.env.SUPABASE_URL);
  // try {
  //   const deleteResult = await deleteStore(); // ⬅️ error を受け取る
  //   if (deleteResult && deleteResult.error) {
  //     // ⬅️ error があるかチェック
  //     throw new Error(deleteResult.error || "ストアの削除に失敗しました");
  //   }
  //   console.log("削除成功");

  //   for (let i = 0; i < stores.length; i++) {
  //     const createResult = await createStore(stores[i]); // ⬅️ error を受け取る
  //     if (createResult && createResult.error) {
  //       // ⬅️ error があるかチェック
  //       throw new Error(createResult.error || "ストアの作成に失敗しました");
  //     }
  //   }
  //   console.log("データリセット成功");
  // } catch (err) {
  //   console.log("データリセット失敗:", err.message); // ⬅️ エラーメッセージを表示
  // }
};

resetStore();
