// PageLoading.jsx
import React from "react";
import styles from "./PageLoading.module.css";

const LoadingScreen = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.washer}>
        <div className={styles.ripple}></div>
        <div className={styles.ripple}></div>
        <div className={styles.ripple}></div>
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
        <div className={styles.drum}>
          <div className={styles.drumInner}></div>
        </div>
      </div>

      <div className={styles.textContainer}>
        <div className={styles.loadingText}>
          読み込み中
          <div className={styles.dots}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
