"use client";

import Link from "next/link";
import styles from "./Navber.module.css";
import { Image } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const Navbar = ({ user }) => {
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
          <Image
            src="https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/logo.png"
            boxSize="40px"
            borderRadius="full"
            fit="cover"
            alt="Collecie Logo"
          />
          <span className={styles.logoText}>Collecie</span>
        </Link>

        {/* PC用ナビゲーション */}
        <ul className={styles.navLinks}>
          {user ? (
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
                <Link href="/account" className={styles.navItem}>
                  <span>アカウント</span>
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/auth/login" className={styles.loginBtn}>
                  <span>ログイン</span>
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className={styles.signupBtn}>
                  <span>サインアップ</span>
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
