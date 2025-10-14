import Styles from "@/components/ui/layouts/Flex.module.css";

const Layout = ({ children }) => {
  return <div className={Styles.container}>{children}</div>;
};

export default Layout;
