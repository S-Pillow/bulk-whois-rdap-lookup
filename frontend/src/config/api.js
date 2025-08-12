// Dynamically determine the API base path
const BACKEND_PATH = import.meta.env.VITE_BACKEND_PATH || "/api"; // 🔥 Default to /api, not /backend
const LOCAL_DEV_SERVER = import.meta.env.VITE_DEV_SERVER || "http://localhost:8000";

// Select base API URL based on environment
const API_URL = import.meta.env.PROD
  ? `${window.location.origin}${BACKEND_PATH}` // Production: use domain + /api path
  : LOCAL_DEV_SERVER;                           // Development: local server

export const getApiUrl = (path) => {
  // Debug logs for API URL construction
  console.log('Base API URL:', API_URL);
  console.log('Path:', path);
  const url = `${API_URL}${path}`;
  console.log('Making API request to:', url);

  // Log environment information
  console.log('Environment:', import.meta.env.PROD ? 'Production' : 'Development');
  console.log('Window location:', window.location.origin);
  console.log('Backend path:', BACKEND_PATH);
  
  return url;
};
