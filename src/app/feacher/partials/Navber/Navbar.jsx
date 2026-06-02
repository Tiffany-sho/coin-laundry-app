"use client";

import Link from "next/link";
import styles from "./Navber.module.css";
import { useEffect, useState } from "react";

const Navbar = ({ user, hasOrg = true }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <nav className={`${styles.navbar} ${!isVisible ? styles.hidden : ""}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Collecie</span>
        </Link>

        {/* PC用ナビゲーション */}
        <ul className={styles.navLinks}>
          {user ? (
            hasOrg ? (
              <>
                <li>
                  <Link href="/coinLaundry" className={styles.navItem}>
                    <span>店舗</span>
                  </Link>
                </li>
                <li>
                  <Link href="/collectMoney" className={styles.navItem}>
                    <span>収益</span>
                  </Link>
                </li>
                <li>
                  <Link href="/inventory" className={styles.navItem}>
                    <span>在庫</span>
                  </Link>
                </li>
                <li>
                  <Link href="/equipment" className={styles.navItem}>
                    <span>設備</span>
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className={styles.navItem}>
                    <span>設定</span>
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <Link href="/settings" className={styles.navItem}>
                  <span>設定</span>
                </Link>
              </li>
            )
          ) : (
            <>
              <li>
                <Link href="/auth/login" className={styles.loginBtn}>
                  <span>ログイン</span>
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className={styles.signupBtn}>
                  <span>新規登録</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
