"use client";

import { useState, useEffect } from "react";
import styles from "./SplashScreen.module.css";

export default function SplashScreen() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const minWait = new Promise((resolve) => setTimeout(resolve, 1500));
    const pageLoad = new Promise((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", resolve, { once: true });
    });
    Promise.all([minWait, pageLoad]).then(() => setLeaving(true));
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const goneTimer = setTimeout(() => setGone(true), 550);
    return () => clearTimeout(goneTimer);
  }, [leaving]);

  if (gone) return null;

  return (
    <div className={`${styles.splash} ${leaving ? styles.leaving : ""}`}>
      <p className={styles.company}>Biencasa</p>
      <p className={styles.appName}>Collecie</p>
    </div>
  );
}
