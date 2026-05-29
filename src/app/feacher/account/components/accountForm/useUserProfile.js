"use client";
import { useCallback, useEffect, useState } from "react";
import { getProfile, updateProfile, updateAvatarUrl } from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";
import { uploadAvatar } from "@/app/api/supabaseFunctions/supabaseStorage/action";
import { showToast } from "@/functions/makeToast/toast";

export function useUserProfile({ onSuccess } = {}) {
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState(null);
  const [username, setUsername] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getProfile();
    if (error) {
      alert("ユーザデータの取得に失敗しました");
    } else if (data) {
      setFullname(data.full_name);
      setUsername(data.username);
      setAvatarUrl(data.avatar_url ?? null);
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
      onSuccess?.();
    }
    setLoading(false);
  };

  const handleAvatarChange = async (file) => {
    setAvatarLoading(true);
    try {
      const url = await uploadAvatar(file);
      const { error } = await updateAvatarUrl(url);
      if (error) {
        showToast("error", "アバターの更新に失敗しました");
      } else {
        setAvatarUrl(`${url}?t=${Date.now()}`);
        showToast("success", "アバターを更新しました");
      }
    } catch (e) {
      showToast("error", e.message ?? "アバターのアップロードに失敗しました");
    }
    setAvatarLoading(false);
  };

  return {
    loading,
    fullname,
    username,
    avatarUrl,
    avatarLoading,
    setFullname,
    setUsername,
    handleUpdate,
    handleAvatarChange,
  };
}
