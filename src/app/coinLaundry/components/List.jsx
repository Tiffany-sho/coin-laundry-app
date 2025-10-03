"use client";
import { useState, useEffect } from "react";
import ListSkeleton from "@/app/coinLaundry/components/ListSkeleton";
import ListCard from "@/app/coinLaundry/components/ListCard";

const List = () => {
  const [coinLaundries, setCoinLaundries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoinLaundryStories = async () => {
      const response = await fetch("/api/coinLaundry");
      const result = await response.json();
      if (result.success) {
        setCoinLaundries(result.data);
      }
      setLoading(false);
    };
    fetchCoinLaundryStories();
  }, []);

  if (!loading && coinLaundries.length === 0) {
    return <div>登録店舗は見つかりませんでした</div>;
  }

  if (loading) {
    return <ListSkeleton />;
  }

  return (
    <>
      {coinLaundries.map((coinLaundry) => {
        return (
          <div key={coinLaundry._id}>
            <ListCard coinLaundry={coinLaundry} />
          </div>
        );
      })}
    </>
  );
};

export default List;
