import CollectMoneyForm from "./components/CollectMoneyForm";

const CollectMoneyLaundry = async ({ params }) => {
  const { id } = await params;
  const coinLaundry = id;
  return (
    <>
      <CollectMoneyForm id={coinLaundry} />
    </>
  );
};

export default CollectMoneyLaundry;
