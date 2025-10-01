import { Button, Link } from "@chakra-ui/react";
import { IoMdAdd } from "react-icons/io";

const AddBtn = () => {
  return (
    <Link href={"/coinLaundry/new"}>
      <Button
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgColor="gray.700"
        color="white"
        ml="auto"
        w="50px"
        h="50px"
        borderRadius="full"
      >
        <IoMdAdd style={{ height: "30px", width: "30px" }} />
      </Button>
    </Link>
  );
};

export default AddBtn;
