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
  const [role, setRole] = useState("店舗管理者");

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      setProgress((step / totalSteps) * 100);
    } else {
      setProgress(100);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setProgress(((step - 2) / totalSteps) * 100);
  };

  const handleReset = () => {
    setStep(1);
    setProgress(0);
  };

  const value = {
    handleNext,
    handleBack,
    handleReset,
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
