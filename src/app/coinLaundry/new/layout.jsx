import Styles from "@/components/ui/layouts/Flex.module.css";

const FormLayout = ({ children }) => {
  return <div className={Styles.container}>{children}</div>;
};

export default FormLayout;
