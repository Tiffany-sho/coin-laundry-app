import React from "react";
import styles from "./ErrorPage.module.css";

const ErrorPage = ({ title, status }) => {
  const getDefaultContent = () => {
    switch (status) {
      case 404:
        return {
          icon: "🔍",
          title: title || "情報が見つかりません",
          message:
            "お探しのデータは見つかりませんでした。検索条件を変更してもう一度お試しください。",
        };
      case 505:
        return {
          icon: "📡",
          title: title || "ネットワークエラー",
          message: "インターネット接続を確認して、もう一度お試しください。",
        };

      default:
        return {
          icon: "⚠️",
          title: title || "エラーが発生しました",
          message:
            "予期しないエラーが発生しました。時間をおいてもう一度お試しください。",
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>{content.icon}</div>
        <h1 className={styles.title}>{content.title}</h1>
        <p className={styles.message}>{content.message}</p>
      </div>
    </div>
  );
};

export default ErrorPage;
