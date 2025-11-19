"use client";

import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
import styles from "./FooterNavber.module.css";
import { useEffect, useState } from "react";

const FooterNavbar = () => {
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
    <nav
      className={`${styles.footerNavbar} ${!isVisible ? styles.hidden : ""}`}
    >
      <div className={styles.container}>
        <>
          <Link href="/" className={styles.navItem}>
            <span className={styles.icon}>
              <Icon.IoHomeOutline />
            </span>
            <span className={styles.label}>ホーム</span>
          </Link>
          <Link href="/coinLaundry" className={styles.navItem}>
            <span className={styles.icon}>
              <Icon.MdOutlineLocalLaundryService />
            </span>
            <span className={styles.label}>店舗</span>
          </Link>
          <Link href="/collectMoney" className={styles.navItem}>
            <span className={styles.icon}>
              <Icon.BiCoinStack />
            </span>
            <span className={styles.label}>収益</span>
          </Link>
          <Link href="/account" className={styles.navItem}>
            <span className={styles.icon}>
              <Icon.RiAccountCircleLine />
            </span>
            <span className={styles.label}>アカウント</span>
          </Link>
        </>
      </div>
    </nav>
  );
};

export default FooterNavbar;
