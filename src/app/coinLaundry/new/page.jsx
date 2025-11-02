import CoinLaundryForm from "@/app/feacher/coinLandry/components/CoinLaundryForm/CoinLaundryForm";
import CoinLaundryFormContextProvider from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";

const createLaundry = () => {
  return (
    <CoinLaundryFormContextProvider>
      <CoinLaundryForm method="POST" />
    </CoinLaundryFormContextProvider>
  );
};

export default createLaundry;
