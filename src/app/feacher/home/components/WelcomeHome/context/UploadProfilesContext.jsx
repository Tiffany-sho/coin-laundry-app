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
  const [role, setRole] = useState("owner");

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
