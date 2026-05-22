"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Styles from "./ActionMenu.module.css";
import * as Icon from "@/app/feacher/Icon";
import DeleteStoreDialog from "@/app/feacher/dialog/DeleteStoreDialog";

const ActionMenu = ({ id, store }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleEdit = () => {
    setIsOpen(false);
    router.push(`/coinLaundry/${id}/edit`);
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
              <DeleteStoreDialog id={id} store={store} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ActionMenu;
