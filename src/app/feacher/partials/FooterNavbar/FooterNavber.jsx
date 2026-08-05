"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icon from "@/app/feacher/Icon";
import styles from "./FooterNavber.module.css";
import { useEffect, useRef, useState } from "react";

/**
 * ⚠️ **経費を 2026-08-05 に足した。** それまで `/collectMoney/expenses` にあり、
 *    毎日触る記録なのに 収益 → 経費 の 2 タップが要っていた
 *    （アプリは 2026-08-03 に同じ理由でタブへ昇格させてある）。
 *
 * ⚠️ **設定は残す。** アプリは設定をホームの歯車へ移したが、**Web の上部ナビは
 *    769px 以下で `display: none`** なので、フッターから外すと
 *    **スマホから設定へ二度と辿り着けない。** 数を 5 に戻すために
 *    設定を落とさないこと。
 *
 * ⚠️ **数を変えたら CSS も追従する。** グリッドの列数と丸い印の位置は
 *    `--nav-count` から計算している（`FooterNavber.module.css`）。
 */
const ALL_NAV_ITEMS = [
  { href: "/",             icon: <Icon.IoHomeOutline />,                label: "ホーム" },
  { href: "/coinLaundry",  icon: <Icon.MdOutlineLocalLaundryService />, label: "店舗" },
  { href: "/collectMoney", icon: <Icon.BiCoinStack />,                  label: "収益" },
  { href: "/inventory",    icon: <Icon.LuPackage />,                    label: "管理" },
  { href: "/expenses",     icon: <Icon.LuWallet />,                     label: "経費" },
  { href: "/settings",     icon: <Icon.LuSettings />,                   label: "設定" },
];

const RESTRICTED_NAV_ITEMS = [
  { href: "/",         icon: <Icon.IoHomeOutline />, label: "ホーム" },
  { href: "/settings", icon: <Icon.LuSettings />,    label: "設定" },
];

const FooterNavbar = ({ hasOrg = true }) => {
  const NAV_ITEMS = hasOrg ? ALL_NAV_ITEMS : RESTRICTED_NAV_ITEMS;
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  /*
    ⚠️ **直前のスクロール量は state ではなく ref で持つ。**
       state だと毎回 effect の依存が変わってスクロールのたびに
       addEventListener / removeEventListener をやり直すことになり、
       登録し直す隙のイベントを取りこぼして表示が飛ぶ。
  */
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      /*
        ⚠️ **一番下では必ず出す。** 下向きに読み進めたまま最下部へ着くと
           「隠す」の判定のままナビが消えて戻ってこない。
        ⚠️ 端数のズレ（ブラウザのズーム・小数の高さ）で一致しないことがあるので
           2px の余裕を持たせる。
      */
      const atBottom =
        currentScrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;

      if (currentScrollY < 10 || atBottom) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // 読み込み直後にすでにスクロール位置がある場合（戻る操作など）に合わせる
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    if (href === "/inventory") {
      return pathname.startsWith("/inventory") || pathname.startsWith("/equipment");
    }
    return pathname.startsWith(href);
  };

  const activeIndex = NAV_ITEMS.findIndex(({ href }) => isActive(href));

  return (
    <nav className={`${styles.footerNavbar} ${!isVisible ? styles.hidden : ""}`}>
      {/*
        ⚠️ **列数を CSS に書かず、ここから渡す。** 以前は CSS が `repeat(5, 1fr)` と
           `left: calc(idx * 20% + 10%)` を直に持っていたので、**組織未所属の
           2 項目のときに丸い印が項目の中心から外れていた**（2 列なのに 5 列の
           前提で位置を計算していた）。項目を増減させるたびに 2 か所を直す形にしない。
      */}
      <div
        className={styles.container}
        style={{
          "--active-idx": activeIndex >= 0 ? activeIndex : 0,
          "--nav-count": NAV_ITEMS.length,
        }}
      >
        {activeIndex >= 0 && <div className={styles.pill} />}
        {NAV_ITEMS.map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.navItem} ${isActive(href) ? styles.active : ""}`}
          >
            <span className={styles.icon}>{icon}</span>
            <span className={styles.label}>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default FooterNavbar;
