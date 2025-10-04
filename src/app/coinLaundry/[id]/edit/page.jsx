import Form from "./components/Form";

const updateLaundry = async ({ params }) => {
  const { id } = await params;
  const updateId = id;
  return <Form id={updateId} method="POST" />;
};

export default updateLaundry;
