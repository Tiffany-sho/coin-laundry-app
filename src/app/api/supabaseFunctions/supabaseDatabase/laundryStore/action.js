"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "../user/action";

async function getMyOrgId(supabase, userId) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", userId)
    .single();
  if (error) return {};
  return { orgId: data.org_id, myRole: data.role };
}

export async function getStores() {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();
  const { orgId } = await getMyOrgId(supabase, user.id);
  if (!orgId) return { data: [] };

  try {
    const { data, error } = await supabase
      .from("laundry_store")
      .select("*")
      .eq("organization_id", orgId);

    if (error) return { error: { msg: "データの取得に失敗しました", status: 500 } };
    return { data };
  } catch {
    return { error: { msg: "予期しないエラーが発生しました", status: 400 } };
  }
}

export async function getStore(id) {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();
  const { orgId } = await getMyOrgId(supabase, user.id);
  if (!orgId) return { error: { msg: "組織が見つかりません", status: 403 } };

  try {
    const { data: coinLaundryStore, error } = await supabase
      .from("laundry_store")
      .select("*")
      .eq("organization_id", orgId)
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return { error: { msg: "データの取得に失敗しました", status: 500 } };
    }
    return { data: coinLaundryStore };
  } catch {
    return { error: { msg: "予期しないエラーが発生しました", status: 400 } };
  }
}

export async function createStore(formData) {
  const supabase = await createClient();
  const { user } = await getUser();
  if (!user) return { error: "ユーザーが認証されていません。" };

  const { orgId, myRole } = await getMyOrgId(supabase, user.id);
  if (!orgId || myRole !== "owner") return { error: "店舗を作成する権限がありません。" };

  const machinesString = formData.get("machines");
  const imagesString = formData.get("images");
  const machinesData = machinesString ? JSON.parse(machinesString) : [];
  const imagesData = imagesString ? JSON.parse(imagesString) : [];

  try {
    const { data, error: storeError } = await supabase
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

    const { error: stockError } = await supabase.from("laundry_state").insert({
      laundryId: data.id,
      laundryName: data.store,
      detergent: 0,
      softener: 0,
      machines: machinesState,
      stocker: data.owner,
    });

    if (stockError) return { error: "在庫情報の登録に失敗しました" };
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
  if (!orgId || myRole !== "owner") return { error: "店舗を編集する権限がありません。" };

  const machinesString = formData.get("machines");
  const imagesString = formData.get("images");
  const afterMachine = machinesString ? JSON.parse(machinesString) : [];
  const imagesData = imagesString ? JSON.parse(imagesString) : [];

  const { data: beforeData } = await getStore(id);
  const beforeMachineArray = beforeData.machines.map((m) => m.name);
  const afterMachineArray = afterMachine.map((m) => m.name);
  const addMachine = afterMachineArray.filter((m) => !beforeMachineArray.includes(m));
  const deleteMachine = beforeMachineArray.filter((m) => !afterMachineArray.includes(m));

  try {
    const { data, error } = await supabase
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

    const { data: machinesState, error: machinesError } = await supabase
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

    const { error: stockError } = await supabase
      .from("laundry_state")
      .update({ laundryName: data.store, machines: newMachinesState })
      .eq("laundryId", data.id);

    if (stockError) return { error: "設備状況編集に失敗しました" };

    const { error: fundsError } = await supabase
      .from("collect_funds")
      .update({ laundryName: data.store })
      .eq("laundryId", data.id);

    if (fundsError) return { error: "集金データの編集に失敗しました" };
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
  if (!orgId || myRole !== "owner") return { error: "店舗を削除する権限がありません。" };

  try {
    const { data, error } = await supabase
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
