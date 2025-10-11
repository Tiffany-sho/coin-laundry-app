import MoneyDataList from "./components/MoneyDataList";

const Page = async ({ params }) => {
  const { id } = await params;
  const findId = id;
  return <MoneyDataList id={findId} />;
};

export default Page;
