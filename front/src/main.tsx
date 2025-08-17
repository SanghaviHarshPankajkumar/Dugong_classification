import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import axios from "axios";
import { getApiConfig } from "@/lib/api-config";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Get API configuration for the current environment
const apiConfig = getApiConfig();

// Configure axios with the appropriate base URL
axios.defaults.baseURL = apiConfig.baseURL;
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.timeout = apiConfig.timeout;

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === "development") {
      // console.log(
      //   `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
      // );
      // console.log(`📍 Base URL: ${apiConfig.baseURL}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      // console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === "development") {
      // console.error(
      //   `❌ API Error: ${error.response?.status || "Network Error"} ${error.config?.url}`
      // );
      // console.error("Error details:", error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// Log environment information for debugging
// const envInfo = getEnvironmentInfo();
// console.log(`🌍 Environment: ${envInfo.nodeEnv}`);
// console.log(`🔗 Base URL: ${apiConfig.baseURL}`);
// console.log(`📍 Current Origin: ${envInfo.origin}`);
// console.log(`🐳 Docker Environment: ${envInfo.isDocker}`);
// console.log(`💻 Local Development: ${envInfo.isLocalDev}`);
// console.log(`⚡ Vite Development: ${envInfo.isViteDev}`);

// // Verify axios configuration
// console.log(`🔧 Axios Default Base URL: ${axios.defaults.baseURL}`);
// console.log(`🔧 Axios Default Timeout: ${axios.defaults.timeout}ms`);
// console.log(`🔧 Axios Default Headers:`, axios.defaults.headers.common);

// Test axios configuration with a simple request
if (process.env.NODE_ENV === "development") {
  // console.log("🧪 Testing axios configuration...");
  // This will show in the request interceptor
  setTimeout(() => {
    axios.get("/health").catch(() => {
      // Expected to fail in local dev since backend is on port 8000
      // console.log(
      //   "✅ Axios configuration test completed - request went to correct base URL"
      // );
    });
  }, 1000);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />

        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
