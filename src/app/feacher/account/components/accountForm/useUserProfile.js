"use client";
import { useCallback, useEffect, useState } from "react";
import {
  getProfile,
  updateProfile,
} from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";
import { showToast } from "@/functions/makeToast/toast";

export function useUserProfile() {
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState(null);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getProfile();
    if (error) {
      alert("ユーザデータの取得に失敗しました");
    } else if (data) {
      setFullname(data.full_name);
      setUsername(data.username);
      setRole(data.role);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await updateProfile({ fullname, username });
    if (error) {
      showToast("error", "プロフィールを更新に失敗しました");
    } else {
      await showToast("success", "プロフィールを更新しました");
    }
    setLoading(false);
  };

  return { loading, fullname, username, role, setFullname, setUsername, handleUpdate };
}
