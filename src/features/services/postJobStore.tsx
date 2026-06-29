import React, { createContext, useContext, useState } from "react";

export interface JobFormData {
  title: string;
  description: string;
  budget: string; // 👈 1. Added budget property tracker
  serviceId: number | null;
  latitude: number | null;
  longitude: number | null;
  address: string;
  localImageUri: string | null;
}

interface JobStoreType {
  formData: JobFormData;
  updateFields: (fields: Partial<JobFormData>) => void;
  clearForm: () => void;
}

const JobStoreContext = createContext<JobStoreType | undefined>(undefined);

export const JobStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    budget: "", // 👈 2. Initialized empty budget form state
    serviceId: null,
    latitude: null,
    longitude: null,
    address: "",
    localImageUri: null,
  });

  const updateFields = (fields: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const clearForm = () => {
    setFormData({ title: "", description: "", budget: "", serviceId: null, latitude: null, longitude: null, address: "", localImageUri: null });
  };

  return (
    <JobStoreContext.Provider value={{ formData, updateFields, clearForm }}>
      {children}
    </JobStoreContext.Provider>
  );
};

export const useJobFormStore = () => {
  const context = useContext(JobStoreContext);
  if (!context) throw new Error("useJobFormStore must be used within a JobStoreProvider");
  return context;
};