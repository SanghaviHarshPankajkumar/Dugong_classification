import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface UseNavigationGuardOptions {
  enabled?: boolean;
  message?: string;
  title?: string;
  onBeforeNavigate?: () => boolean | Promise<boolean>;
  onConfirmNavigate?: () => void;
  onCancelNavigate?: () => void;
}

export const useNavigationGuard = ({
  enabled = true,
  onBeforeNavigate,
  onConfirmNavigate,
  onCancelNavigate,
}: UseNavigationGuardOptions = {}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const navigate = useNavigate();
  const location = useLocation();

  // Function to show confirmation dialog
  const showConfirmation = useCallback((to: string) => {
    setPendingNavigation(to);
    setShowConfirmDialog(true);
  }, []);

  // Function to confirm navigation
  const confirmNavigation = useCallback(async () => {
    if (!pendingNavigation) return;

    try {
      // Call custom handler if provided
      if (onBeforeNavigate) {
        const shouldProceed = await onBeforeNavigate();
        if (!shouldProceed) {
          setShowConfirmDialog(false);
          setPendingNavigation(null);
          return;
        }
      }

      // Call confirm handler
      if (onConfirmNavigate) {
        onConfirmNavigate();
      }

      // Navigate to the pending location
      navigate(pendingNavigation);
    } catch (error) {
      // console.error('Navigation guard error:', error);
    } finally {
      setShowConfirmDialog(false);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, onBeforeNavigate, onConfirmNavigate, navigate]);

  // Function to cancel navigation
  const cancelNavigation = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingNavigation(null);

    if (onCancelNavigate) {
      onCancelNavigate();
    }
  }, [onCancelNavigate]);

  // Function to navigate with guard
  const navigateWithGuard = useCallback(
    async (to: string) => {
      if (!enabled) {
        navigate(to);
        return;
      }

      // Check if we're navigating to the same location
      if (to === location.pathname) {
        return;
      }

      // Show confirmation dialog
      showConfirmation(to);
    },
    [enabled, navigate, location.pathname, showConfirmation]
  );

  // Function to navigate without guard (for confirmed actions)
  const navigateWithoutGuard = useCallback(
    (to: string) => {
      navigate(to);
    },
    [navigate]
  );

  return {
    showConfirmDialog,
    pendingNavigation,
    confirmNavigation,
    cancelNavigation,
    navigateWithGuard,
    navigateWithoutGuard,
    setShowConfirmDialog,
  };
};
