import { useEffect } from "react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/auth";
import { useUploadStore } from "@/store/upload";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import { useBeforeUnload } from "@/hooks/useBeforeUnload.ts";
// import axios from "axios";
import { getApiConfig } from "@/lib/api-config";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => {
  const setToken = useAuthStore((state) => state.setToken);
  const token = useAuthStore((state) => state.token);
  const sessionId = useUploadStore((state) => state.sessionId);

  // Get API configuration for constructing cleanup URLs
  const apiConfig = getApiConfig();

  // Sync Zustand with cookie on app load
  useEffect(() => {
    const cookieToken = Cookies.get("access_token");
    if (cookieToken && !token) {
      setToken(cookieToken);
    }
  }, [setToken, token]);

  // Handle cleanup when user actually closes the tab (if possible)
  const handleUnload = () => {
    if (token && sessionId) {
      // console.log(
      // "🔄 Tab close detected - beacon cleanup will handle session cleanup for:",
      // sessionId
      // );
    } else {
      // console.log("ℹ️ No session to cleanup on unload");
    }
  };

  // Use custom hook for tab/browser close confirmation only
  // This does NOT detect tab switching - users can freely switch between tabs
  useBeforeUnload({
    enabled: !!(token && sessionId),
    message:
      "Are you sure you want to close this tab? Your session will be lost and your work may not be preserved.",
    onUnload: handleUnload,
    cleanupUrl: `${apiConfig.baseURL}/api/cleanup-session-beacon`, // Full backend URL
    sessionId: sessionId || undefined,
  });

  // Log when the hook is enabled/disabled
  useEffect(() => {
    if (token && sessionId) {
      // console.log(
      //   "🔒 Session cleanup protection enabled for session:",
      //   sessionId
      // );
      // console.log("🔒 API Config:", apiConfig);
      // console.log(
      //   "🔒 Cleanup URL configured:",
      //   `${apiConfig.baseURL}/api/cleanup-session-beacon`
      // );

      // Test beacon functionality (development only)
      if (process.env.NODE_ENV === "development") {
        // Add a test button to the page for manual testing
        const testBeacon = () => {
          // console.log("🧪 Testing beacon cleanup manually...");
          // console.log("🧪 Session ID:", sessionId);
          // console.log(
          //   "🧪 Cleanup URL:",
          //   `${apiConfig.baseURL}/api/cleanup-session-beacon`
          // );

          const cleanupData = new FormData();
          cleanupData.append("session_id", sessionId);
          cleanupData.append("source", "manual_test");

          // const success = navigator.sendBeacon(
          //   `${apiConfig.baseURL}/api/cleanup-session-beacon`,
          //   cleanupData
          // );
          // console.log(
          //   "🧪 Manual beacon test result:",
          //   success ? "SUCCESS" : "FAILED"
          // );

          // if (success) {
          //   // console.log("✅ Beacon sent successfully - check backend logs");
          // } else {
          //   // console.error("❌ Beacon failed to send - check URL and network");
          // }
        };

        // Add test function to window for console access
        (window as any).testBeacon = testBeacon;
        // console.log("🧪 Manual beacon test available: window.testBeacon()");

        // Also add a test function that uses axios to verify endpoint accessibility
        // const testEndpoint = async () => {
        //   // console.log("🧪 Testing endpoint accessibility with axios...");
        //   try {
        //     const response = await axios.post(
        //       `${apiConfig.baseURL}/api/test-beacon`
        //     );
        //     // console.log("✅ Endpoint accessible via axios:", response.data);
        //   } catch (error) {
        //     // console.error("❌ Endpoint not accessible via axios:", error);
        //   }
        // };

        // (window as any).testEndpoint = testEndpoint;
        // console.log("🧪 Endpoint test available: window.testEndpoint()");
      }
    } else {
      // console.log("🔓 Session cleanup protection disabled - no active session");
    }
  }, [token, sessionId, apiConfig.baseURL]);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
