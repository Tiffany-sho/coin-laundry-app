"use client";

import { useState } from "react";
import styles from "./UpdatePassword.module.css";

export default function ChangePassword({ action }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.container}>
      <form className={styles.form}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>パスワード変更</h1>
            <p className={styles.description}>
              新しいパスワードを入力してください
            </p>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.fieldGroup}>
              <label htmlFor="password" className={styles.label}>
                新しいパスワード
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="新しいパスワード"
                  required
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.toggleButton}
                  aria-label={
                    showPassword ? "パスワードを隠す" : "パスワードを表示"
                  }
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.cardFooter}>
            <button
              formAction={action}
              type="submit"
              className={styles.submitButton}
            >
              変更
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
