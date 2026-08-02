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

  /*
    ⚠️ **保存しない切り替え。** 一時保存した下書きを戻すときに使う。
       `handleMethodChange` を呼ぶと `fixed` のときに既定の集金方法まで
       書き換わってしまう（下書きを戻しただけで設定が変わるのはやりすぎ）。
  */
  return { checked, setChecked, fixed, loading, handleMethodChange, handleFixedChange };
};

export default useCollectMethod;
