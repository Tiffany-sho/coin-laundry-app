"use client";

import { useEffect, useState } from "react";

const draftKey = (storeId) => `draft_collect_${storeId}`;

const useDraft = (storeId) => {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(draftKey(storeId));
    if (!saved) return;
    try {
      setDraft(JSON.parse(saved));
    } catch {
      localStorage.removeItem(draftKey(storeId));
    }
  }, [storeId]);

  const saveDraft = (data) => {
    const payload = { ...data, savedAt: Date.now() };
    localStorage.setItem(draftKey(storeId), JSON.stringify(payload));
    setDraft(payload);
  };

  const discardDraft = () => {
    localStorage.removeItem(draftKey(storeId));
    setDraft(null);
  };

  const clearDraft = () => {
    localStorage.removeItem(draftKey(storeId));
  };

  return { draft, saveDraft, discardDraft, clearDraft };
};

export default useDraft;
