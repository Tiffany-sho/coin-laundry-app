"use client";

import { Badge } from "@chakra-ui/react";
import { useState, useEffect } from "react";

const MonthBadge = () => {
  const [month, setMonth] = useState("");

  useEffect(() => {
    setMonth(`${new Date().getMonth() + 1}月`);
  }, []);

  return (
    <Badge
      bg="whiteAlpha.300"
      color="white"
      fontSize="xs"
      px={2}
      py={1}
      borderRadius="full"
    >
      {month}
    </Badge>
  );
};

export default MonthBadge;
