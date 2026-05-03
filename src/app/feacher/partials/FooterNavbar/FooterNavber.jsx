"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icon from "@/app/feacher/Icon";
import styles from "./FooterNavber.module.css";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/",            icon: <Icon.IoHomeOutline />,                    label: "ホーム" },
  { href: "/coinLaundry", icon: <Icon.MdOutlineLocalLaundryService />,     label: "店舗" },
  { href: "/collectMoney",icon: <Icon.BiCoinStack />,                      label: "収益" },
  { href: "/account",     icon: <Icon.RiAccountCircleLine />,              label: "アカウント" },
];

const FooterNavbar = () => {
  const pathname = usePathname();
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
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className={`${styles.footerNavbar} ${!isVisible ? styles.hidden : ""}`}>
      <div className={styles.container}>
        {NAV_ITEMS.map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.navItem} ${isActive(href) ? styles.active : ""}`}
          >
            <span className={styles.icon}>{icon}</span>
            <span className={styles.label}>{label}</span>
            <span className={styles.indicator} />
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default FooterNavbar;
