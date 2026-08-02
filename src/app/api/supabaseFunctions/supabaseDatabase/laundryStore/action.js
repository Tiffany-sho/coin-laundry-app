"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../user/action";
import {
  attachPaymentMethods,
  reconcileStorePaymentMethods,
} from "../paymentMethods/action";
import { getMyStoreScope } from "../memberStores/action";
import { PLAN_LIMITS } from "@/functions/plans";

async function getMyOrgId(supabase, userId) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", userId)
    .single();
  if (error) return {};
  return { orgId: data.org_id, myRole: data.role };
}

const machineName = (value) => String(value ?? "").trim();

/**
 * 設備の id を安定させる。**保存のたびに作り直さない。**
 *
 * ⚠️ **`collect_funds.fundsArray[].id` は集金を登録した時点の id を焼き込む。**
 *    振り直すと過去の集金との対応が切れる。2026-08-02 まで Web の
 *    `useStoreSubmit.js` が全機器に `crypto.randomUUID()` を配り直していて、
 *    **機器別の売上内訳が同じ台を「店舗を編集した回数」だけ別の行に割っていた。**
 *
 * 引き継ぐ順に見る:
 *   1. **同じ名前**の設備が前からあれば、その id（＝ほとんどの場合ここ）
 *   2. クライアントが送ってきた id（改名したときの救済。アプリは温存して送る）
 *   3. どちらも無ければ新規発行
 *
 * ⚠️ **同じ id を 2 つの設備に配らない。** 同名を 2 つ登録した場合と、
 *    「A を B に改名 + 新しい A を追加」の場合に起きうる。使った id は
 *    取り除き、衝突したら発行し直す。
 *
 * ⚠️ この関数は**サーバ側の最後の砦**。クライアントが何を送っても id は保たれる。
 *    Web / アプリの両方を通るので、片方だけ直すより確実。
 */
function stableMachineIds(afterMachines, beforeMachines) {
  /** 名前 → その名前で前から使われていた id の並び */
  const inherited = new Map();
  for (const machine of beforeMachines ?? []) {
    const key = machineName(machine?.name);
    if (!key || !machine?.id) continue;
    if (!inherited.has(key)) inherited.set(key, []);
    inherited.get(key).push(String(machine.id));
  }

  const used = new Set();
  return (afterMachines ?? []).map((machine) => {
    const queue = inherited.get(machineName(machine?.name));
    let id = queue && queue.length > 0 ? queue.shift() : null;
    if (!id && machine?.id) id = String(machine.id);
    if (!id || used.has(id)) id = crypto.randomUUID();
    used.add(id);
    return { ...machine, id };
  });
}

/**
 * 自分が見てよい店舗の一覧。
 *
 * ⚠️ **ここが担当店舗（011）を強制する唯一の場所。**
 *    集金（collectFunds）も在庫（laundryState）も、自前の `getOrgStoreIds()` から
 *    この関数を呼んでいて、**合計 20 か所以上がここを通る。**
 *    個々の関数に判定を撒くと必ず撒き漏らすので、入口で絞る。
 *
 * ⚠️ **`laundry_store` を直接引く経路を新しく作らないこと。**
 *    作った時点でそこだけ担当店舗を素通りする。
 *
 * ⚠️ **admin は全店舗**（`storeIds === null`）。空配列とは意味が違うので
 *    `storeIds?.length` のような書き方で判定しないこと。
 *
 * cache() でリクエスト内の重複呼び出しを1回に集約する。
 */
export const getStores = cache(async () => {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();
  const { orgId } = await getMyOrgId(supabase, user.id);
  if (!orgId) return { data: [] };

  const scope = await getMyStoreScope();
  /* ⚠️ 1 店舗も担当していない人には何も返さない（2026-08-03 の決定）。
        「0 件なら全店舗」に倒さないこと。移行では既存メンバーに
        現在の全店舗を配ってあるので、ここに来るのは新しく入った人。 */
  if (scope.storeIds !== null && scope.storeIds.length === 0) return { data: [] };

  // 組織メンバーであることを確認後、RLSを迂回して取得（閲覧者も参照可能にする）
  const serviceSupabase = createServiceClient();
  try {
    let query = serviceSupabase
      .from("laundry_store")
      .select("*")
      .eq("organization_id", orgId);

    // ⚠️ 組織の条件は外さない。担当店舗が他組織の id を持っていても弾くため
    if (scope.storeIds !== null) query = query.in("id", scope.storeIds);

    const { data, error } = await query;

    if (error) return { error: { msg: "データの取得に失敗しました", status: 500 } };
    // ⚠️ 支払方法は店舗ごと（009）。一覧に貼って返すので、
    //    集金画面も店舗フォームも追加の往復をしなくてよい
    return { data: await attachPaymentMethods(data) };
  } catch {
    return { error: { msg: "予期しないエラーが発生しました", status: 400 } };
  }
});

export async function getStore(id) {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();
  const { orgId } = await getMyOrgId(supabase, user.id);
  if (!orgId) return { error: { msg: "組織が見つかりません", status: 403 } };

  /*
    ⚠️ **この関数は `getStores()` を通らない**ので、担当店舗の判定を自前で持つ。
       ここを忘れると、一覧に出ない店舗でも **URL を直接叩けば開けてしまう**
       （店舗詳細は /coinLaundry/{id} で id が推測できなくても共有されうる）。
  */
  const scope = await getMyStoreScope();
  if (scope.storeIds !== null && !scope.storeIds.includes(id)) {
    return { error: { msg: "この店舗を閲覧する権限がありません", status: 403 } };
  }

  // 組織メンバーであることを確認後、RLSを迂回して取得（閲覧者も参照可能にする）
  const serviceSupabase = createServiceClient();
  try {
    const { data: coinLaundryStore, error } = await serviceSupabase
      .from("laundry_store")
      .select("*")
      .eq("organization_id", orgId)
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return { error: { msg: "データの取得に失敗しました", status: 500 } };
    }
    const [withMethods] = await attachPaymentMethods([coinLaundryStore]);
    return { data: withMethods };
  } catch {
    return { error: { msg: "予期しないエラーが発生しました", status: 400 } };
  }
}

export async function createStore(formData) {
  const supabase = await createClient();
  const { user } = await getUser();
  if (!user) return { error: "ユーザーが認証されていません。" };

  const { orgId, myRole } = await getMyOrgId(supabase, user.id);
  if (!orgId || myRole !== "admin") return { error: "店舗を作成する権限がありません。" };

  const machinesString = formData.get("machines");
  const imagesString = formData.get("images");
  // ⚠️ 新規でも通す。クライアントが id を送ってこなくても必ず 1 つずつ持たせるため
  //    （下の laundry_state が machine.id をそのまま使う）
  const machinesData = stableMachineIds(machinesString ? JSON.parse(machinesString) : [], []);
  const imagesData = imagesString ? JSON.parse(imagesString) : [];

  const serviceSupabase = createServiceClient();
  try {
    // プラン上限チェック
    const { data: orgData } = await serviceSupabase
      .from("organizations")
      .select("plan")
      .eq("id", orgId)
      .single();

    const plan = orgData?.plan ?? "free";
    const storeLimit = PLAN_LIMITS[plan];

    if (storeLimit !== Infinity) {
      const { count } = await serviceSupabase
        .from("laundry_store")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId);

      if (count >= storeLimit) {
        return {
          error: `プランの上限（${storeLimit}店舗）に達しています。アップグレードしてください。`,
        };
      }
    }

    const { data, error: storeError } = await serviceSupabase
      .from("laundry_store")
      .insert({
        store: formData.get("store"),
        location: formData.get("location"),
        description: formData.get("description"),
        machines: machinesData,
        images: imagesData,
        owner: user.id,
        organization_id: orgId,
      })
      .select("id,machines,store,owner")
      .single();

    if (storeError) return { error: "店舗登録に失敗しました" };

    const machinesState = data.machines.map((machine) => ({
      id: machine.id,
      name: machine.name,
      break: false,
      comment: "",
    }));

    const addStates = [
      { id: crypto.randomUUID(), name: "両替機", break: false, comment: "" },
      { id: crypto.randomUUID(), name: "店内状況", break: false, comment: "" },
      { id: crypto.randomUUID(), name: "備品", break: false, comment: "" },
    ];
    machinesState.unshift(...addStates);

    const { error: stockError } = await serviceSupabase.from("laundry_state").insert({
      laundryId: data.id,
      laundryName: data.store,
      detergent: 0,
      softener: 0,
      machines: machinesState,
      stocker: data.owner,
    });

    if (stockError) return { error: "在庫情報の登録に失敗しました" };

    /*
      ⚠️ **店舗が出来てからでないと入れられない**（laundry_id NOT NULL）。
         ここで失敗しても店舗の登録は成功として返す。支払方法が入らないことより、
         「登録できたのにエラーが出て、押し直すと 2 店舗できる」ほうが困る。
    */
    const methods = formData.get("paymentMethods");
    if (methods !== null) {
      await reconcileStorePaymentMethods(data.id, orgId, JSON.parse(methods));
    }

    return { data };
  } catch {
    return { error: { msg: "予期しないエラーが発生しました", status: 400 } };
  }
}

export async function updateStore(formData, id) {
  const { user } = await getUser();
  if (!user) return { error: "ユーザーが認証されていません。" };

  const supabase = await createClient();
  const { orgId, myRole } = await getMyOrgId(supabase, user.id);
  if (!orgId || myRole !== "admin") return { error: "店舗を編集する権限がありません。" };

  const machinesString = formData.get("machines");
  const imagesString = formData.get("images");
  const imagesData = imagesString ? JSON.parse(imagesString) : [];

  const { data: beforeData } = await getStore(id);

  /*
    ⚠️ **クライアントが送ってきた id をそのまま保存しない。** 前の設備一覧と
       突き合わせて引き継ぐ（`stableMachineIds` の説明を参照）。Web の
       `useStoreSubmit.js` は 2026-08-02 まで全機器に新しい uuid を配っていた。
  */
  const afterMachine = stableMachineIds(
    machinesString ? JSON.parse(machinesString) : [],
    beforeData.machines
  );

  const beforeMachineArray = beforeData.machines.map((m) => m.name);
  const afterMachineArray = afterMachine.map((m) => m.name);
  const addMachine = afterMachineArray.filter((m) => !beforeMachineArray.includes(m));
  const deleteMachine = beforeMachineArray.filter((m) => !afterMachineArray.includes(m));

  const serviceSupabase = createServiceClient();
  try {
    const { data, error } = await serviceSupabase
      .from("laundry_store")
      .update({
        store: formData.get("store"),
        location: formData.get("location"),
        description: formData.get("description"),
        machines: afterMachine,
        images: imagesData,
      })
      .eq("organization_id", orgId)
      .eq("id", id)
      .select("id, store, machines, owner")
      .single();

    if (error) return { error: "店舗情報の更新に失敗しました" };

    const { data: machinesState, error: machinesError } = await serviceSupabase
      .from("laundry_state")
      .select("machines")
      .eq("laundryId", data.id)
      .single();

    if (machinesError) return { error: "設備状況取得に失敗しました" };

    let newMachinesState = [...machinesState.machines];
    const addMachineObj = addMachine.map((machine) => ({
      id: crypto.randomUUID(),
      name: machine,
      break: false,
      comment: "",
    }));
    newMachinesState = [...newMachinesState, ...addMachineObj].filter(
      (machine) => !deleteMachine.includes(machine.name)
    );

    const { error: stockError } = await serviceSupabase
      .from("laundry_state")
      .update({ laundryName: data.store, machines: newMachinesState })
      .eq("laundryId", data.id);

    if (stockError) return { error: "設備状況編集に失敗しました" };

    const { error: fundsError } = await serviceSupabase
      .from("collect_funds")
      .update({ laundryName: data.store })
      .eq("laundryId", data.id);

    if (fundsError) return { error: "集金データの編集に失敗しました" };

    /*
      ⚠️ **送られてこなかったら据え置き。** Web の店舗フォームは支払方法を
         知らないまま保存してくるので、`?? []` にすると**Web で店舗を編集した
         瞬間に支払方法が全部無効になる**（images と同じ罠だが、あちらと違って
         「送らない＝消す」にしていない）。
      ⚠️ 一方で**空配列は「全部無効にする」の意味**。区別を潰さないこと。
    */
    const methods = formData.get("paymentMethods");
    if (methods !== null) {
      const result = await reconcileStorePaymentMethods(data.id, orgId, JSON.parse(methods));
      if (result?.error) return { error: result.error };
    }

    return { data };
  } catch {
    return { error: { msg: "予期しないエラーが発生しました", status: 400 } };
  }
}

export async function deleteStore(id) {
  const { user } = await getUser();
  if (!user) return { error: "ユーザーが認証されていません。" };

  const supabase = await createClient();
  const { orgId, myRole } = await getMyOrgId(supabase, user.id);
  if (!orgId || myRole !== "admin") return { error: "店舗を削除する権限がありません。" };

  const serviceSupabase = createServiceClient();
  try {
    const { data, error } = await serviceSupabase
      .from("laundry_store")
      .delete()
      .eq("organization_id", orgId)
      .eq("id", id)
      .select("store, images")
      .single();

    if (error) return { error: "店舗情報の削除に失敗しました" };

    Promise.all(data.images.map((imageFile) => deleteImage(imageFile.path)))
      .then(() => console.log("Old images cleaned up."))
      .catch((err) => console.error("Cleanup deletion failed:", err));

    return { data };
  } catch {
    return { error: { msg: "予期しないエラーが発生しました", status: 400 } };
  }
}

const deleteImage = async (filePath) => {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("Laundry-Images")
    .remove([`laundry/${filePath}`]);

  if (error) return false;
  if (data.length === 0) return false;
  return true;
};
