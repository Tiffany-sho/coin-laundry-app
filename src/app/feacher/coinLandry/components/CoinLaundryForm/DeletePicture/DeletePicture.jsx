import { useCoinLaundryForm } from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";
import { LuX } from "react-icons/lu";
import styles from "./DeletePicture.module.css";

const DeletePicture = () => {
  const { state, dispatch } = useCoinLaundryForm();

  const deleteAction = (url) => {
    dispatch({ type: "REMOVE_EXISTING_PICTURE", payload: { url } });
  };

  if (state.existingPictures.length === 0) return null;

  return (
    <div className={styles.pictureContainer}>
      <span className={styles.sectionLabel}>既存の写真</span>
      <div className={styles.imageGrid}>
        {state.existingPictures.map((item) => (
          <div key={item.url} className={styles.imageItem}>
            <img src={item.url} alt="既存の写真" />
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => deleteAction(item.url)}
            >
              <LuX />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeletePicture;
