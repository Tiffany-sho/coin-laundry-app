"use client";

import { useActionState } from "react";
import styles from "./ForgetPassword.module.css";

const initState = {
  message: null,
  error: null,
};

export default function SendEmail({ action }) {
  const [state, formAction] = useActionState(action, initState);

  return (
    <div className={styles.container}>
      <form action={formAction} className={styles.form}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>パスワード変更</h1>
            <p className={styles.description}>
              登録されているメールアドレスを入力してください
            </p>
          </div>

          <div className={styles.cardBody}>
            {state?.error && (
              <div className={styles.errorMessage}>{state.error}</div>
            )}
            {state?.message && (
              <div className={styles.successMessage}>{state.message}</div>
            )}

            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.label}>
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.cardFooter}>
            <button type="submit" className={styles.submitButton}>
              送信
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
