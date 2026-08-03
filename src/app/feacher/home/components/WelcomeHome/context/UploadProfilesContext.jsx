"use client";

import { createContext, useContext, useState } from "react";

const UploadProfilesContext = createContext();

export const UploadProfilesProvider = ({ children }) => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [collectMethod, setCollectMethod] = useState("machines");
  const [role, setRole] = useState("admin");
  const [orgName, setOrgName] = useState("");
  /*
    経費を記録するか（012）。⚠️ **admin のときだけ聞く**（組織の設定なので、
    他人の組織に入る人に聞いても反映できない）。
    ⚠️ 既定は true。迷った人が使えるほうへ倒す。あとから設定 → 組織で変えられる。
  */
  const [trackExpenses, setTrackExpenses] = useState(true);

  const handleNext = () => {
    if (step < totalSteps) {
      setProgress(Math.floor((step / totalSteps) * 100));
      setStep(step + 1);
    } else {
      setProgress(100);
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setProgress(Math.floor(((step - 2) / totalSteps) * 100));
  };

  const value = {
    handleNext,
    handleBack,
    progress,
    setProgress,
    step,
    setStep,
    totalSteps,
    fullname,
    setFullname,
    username,
    setUsername,
    collectMethod,
    setCollectMethod,
    role,
    setRole,
    orgName,
    setOrgName,
    trackExpenses,
    setTrackExpenses,
  };

  return (
    <UploadProfilesContext.Provider value={value}>
      {children}
    </UploadProfilesContext.Provider>
  );
};

export const useUploadProfiles = () => {
  return useContext(UploadProfilesContext);
};
