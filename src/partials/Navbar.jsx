import Link from "next/link";
import styles from "./Navbar.module.css";

const Navber = () => {
  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        MyLogo
      </Link>

      <ul className={styles.navList}>
        <li>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/coinLaundry" className={styles.navLink}>
            My Store
          </Link>
        </li>
        <li>
          <Link href="/" className={styles.navLink}>
            Collect Money
          </Link>
        </li>
        <li>
          <Link href="/" className={styles.navLink}>
            My Page
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navber;
