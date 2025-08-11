export interface ApiConfig {
    baseURL: string;
    timeout: number;
    retryAttempts: number;
  }
  
  export const getApiConfig = (): ApiConfig => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isDockerPort = window.location.port === '8080'; // Docker nginx port
    const isVitePort = window.location.port === '5173'; // Vite default port
    
    let baseURL: string;
    let reason = '';
    
    if (isDevelopment) {
      if (isLocalhost && isDockerPort) {
        // We're in Docker development environment
        baseURL = window.location.origin;
        reason = 'Docker development detected (port 8080)';
      } else if (isLocalhost && (isVitePort || window.location.port === '3000')) {
        // We're in local development (Vite port 5173 or React port 3000), backend runs on port 8000
        baseURL = 'http://localhost:8000';
        reason = `Local development detected (port ${window.location.port})`;
      } else if (isLocalhost) {
        // Fallback for other localhost ports
        baseURL = 'http://localhost:8000';
        reason = `Localhost fallback (port ${window.location.port})`;
      } else {
        // Fallback to current origin
        baseURL = window.location.origin;
        reason = 'Non-localhost development fallback';
      }
    } else {
      // In production, always use the current origin
      baseURL = window.location.origin;
      reason = 'Production environment';
    }
    
    // Log the decision for debugging
    if (isDevelopment) {
      // console.log(`🔧 API Config Decision: ${reason}`);
      // console.log(`📍 Detected Port: ${window.location.port}`);
      // console.log(`🔗 Selected Base URL: ${baseURL}`);
    }
    
    return {
      baseURL,
      timeout: 120000, // 2 minutes
      retryAttempts: 3
    };
  };
  
  /**
   * Get the full API URL for a given endpoint
   */
  export const getApiUrl = (endpoint: string): string => {
    const config = getApiConfig();
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${config.baseURL}/${cleanEndpoint}`;
  };
  
  /**
   * Check if we're running in Docker environment
   */
  export const isDockerEnvironment = (): boolean => {
    return window.location.port === '8080';
  };
  
  /**
   * Check if we're running in local development
   */
  export const isLocalDevelopment = (): boolean => {
    return process.env.NODE_ENV === 'development' && 
           (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
           window.location.port !== '8080';
  };
  
  /**
   * Check if we're running in Vite development
   */
  export const isViteDevelopment = (): boolean => {
    return process.env.NODE_ENV === 'development' && 
           (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
           window.location.port === '5173';
  };
  
  /**
   * Debug information about the current environment
   */
  export const getEnvironmentInfo = () => {
    return {
      nodeEnv: process.env.NODE_ENV,
      hostname: window.location.hostname,
      port: window.location.port,
      origin: window.location.origin,
      isDocker: isDockerEnvironment(),
      isLocalDev: isLocalDevelopment(),
      isViteDev: isViteDevelopment(),
      apiConfig: getApiConfig()
    };
  };
  