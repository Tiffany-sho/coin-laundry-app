"use client";

import Link from "next/link";
import styles from "./error.module.css";

export default function ErrorPage({ error, reset }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className={styles.title}>エラーが発生しました</h1>

        <p className={styles.message}>
          {error?.message
            ? error.message
            : "予期しないエラーが発生しました。もう一度お試しください。"}
        </p>

        <div className={styles.actions}>
          <button onClick={reset} className={styles.retryButton}>
            もう一度試す
          </button>
          <Link href="/" className={styles.homeLink}>
            ホームへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
