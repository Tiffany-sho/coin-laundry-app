import React from "react";
import styles from "./PageLoading.module.css";

const LoadingScreen = () => {
  return (
    <div className={styles.loadingContainer}>
      <p className={styles.logo}>Collecie</p>

      <div className={styles.spinnerWrapper}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerDot}></div>
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
