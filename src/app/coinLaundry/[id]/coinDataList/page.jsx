import MonoDataList from "@/app/feacher/collectMoney/components/coinDataList/MonoDataList";

const Page = async ({ params }) => {
  const { id } = await params;
  const findId = id;
  return <MonoDataList id={findId} valiant="aStore" />;
};

export default Page;
