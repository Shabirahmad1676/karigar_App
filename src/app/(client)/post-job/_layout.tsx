import { Slot } from "expo-router";
import { JobStoreProvider } from "../../../features/services/postJobStore";

export default function PostJobWizardLayout() {
  return (
    <JobStoreProvider>
      <Slot />
    </JobStoreProvider>
  );
}