import { UploadPageProvider } from "@/app/feacher/collectMoney/context/UploadPageContext";

const layout = ({ children }) => {
  return <UploadPageProvider>{children}</UploadPageProvider>;
};

export default layout;
