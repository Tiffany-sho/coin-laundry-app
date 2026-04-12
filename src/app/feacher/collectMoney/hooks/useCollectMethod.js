"use client";

import { useEffect, useState } from "react";
import {
  getCollectMethod,
  updateCollectMethod,
} from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";

const useCollectMethod = () => {
  const [checked, setChecked] = useState(false);
  const [fixed, setFixed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await getCollectMethod();
      if (!error && data && data.collectMethod !== null) {
        setChecked(data.collectMethod === "machines");
        setFixed(true);
      } else {
        setChecked(false);
        setFixed(false);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleMethodChange = (e) => {
    const value = e.checked;
    setChecked(value);
    if (fixed) updateCollectMethod(value);
  };

  const handleFixedChange = (e) => {
    const isFixed = e.checked;
    setFixed(isFixed);
    updateCollectMethod(isFixed ? checked : null);
  };

  return { checked, fixed, loading, handleMethodChange, handleFixedChange };
};

export default useCollectMethod;
