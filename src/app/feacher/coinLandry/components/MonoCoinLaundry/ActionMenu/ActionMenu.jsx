"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Styles from "./ActionMenu.module.css";
import { redirect } from "next/navigation";
import AlertDialog from "@/app/feacher/dialog/AlertDialog";
import * as Icon from "@/app/feacher/Icon";
import { deleteStore } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { showToast } from "@/functions/makeToast/toast";

const ActionMenu = ({ id, store }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleEdit = () => {
    setIsOpen(false);
    router.push(`/coinLaundry/${id}/edit`);
  };

  const deleteAction = async () => {
    let responseData;
    const { data, error } = await deleteStore(id);
    responseData = data;

    try {
      if (error) {
        throw new Error("ストアの削除に失敗しました");
      }
    } catch (err) {
      console.error("API Error:", error);
      showToast("error", `${responseData.store}店の削除に失敗しました`);
    }
    showToast("warning", `${responseData.store}店を削除しました`);
    redirect("/coinLaundry");
  };

  return (
    <>
      <button className={Styles.menuBtn} onClick={() => setIsOpen(!isOpen)}>
        <Icon.CiMenuKebab size={24} />
      </button>

      {isOpen && (
        <>
          <div
            className={Styles.menuOverlay}
            onClick={() => setIsOpen(false)}
          />
          <div className={Styles.dropdownMenu}>
            <button
              className={`${Styles.menuItem} ${Styles.edit}`}
              onClick={handleEdit}
            >
              <Icon.CiEdit />
              <span>編集</span>
            </button>
            <div className={`${Styles.menuItem} ${Styles.delete}`}>
              <AlertDialog target={`${store}店`} deleteAction={deleteAction} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ActionMenu;
