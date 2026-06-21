import { useAuth } from "../features/auth/store";

export const useAuthGuard = () => {
  const { token, isGuest, triggerAuthModal } = useAuth();

  /**
   * Evaluates authentication permissions prior to running an interaction handler.
   * @param protectedAction The callback execution loop that requires verified authorization.
   */
  const executeProtectedAction = (protectedAction: () => void) => {
    if (!token || isGuest) {
      if (triggerAuthModal) {
        triggerAuthModal();
      } else {
        console.warn("Authentication Gate interface is not yet registered.");
      }
    } else {
      protectedAction();
    }
  };

  return { executeProtectedAction };
};