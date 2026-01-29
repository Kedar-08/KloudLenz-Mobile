import axios from "axios";

// Configuration for API
export const API_CONFIG = {
  // Backend URL
  BASE_URL: "http://10.0.2.2:8080/api/v1",
  // BASE_URL: "https://calculably-noncretaceous-georgene.ngrok-free.dev/api/v1", // ngrok backend
  TIMEOUT: 10000, // 10 seconds
  USE_MOCK: false, // Using real backend
};

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add authentication token when available
    // const token = await SecureStore.getItemAsync('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      console.error("❌ API Error Response:");
      console.error("   Status:", status);
      console.error("   Data:", JSON.stringify(data, null, 2));
      console.error("   URL:", error.config?.url);

      if (status === 401) {
        // Unauthorized - redirect to login
        console.log("Unauthorized access - redirecting to login");
        // TODO: Clear stored token and redirect to login
      } else if (status === 403) {
        // Forbidden
        console.log("Access forbidden");
      } else if (status === 500) {
        // Server error
        console.log("Server error occurred");
      }

      return Promise.reject(
        data?.message || data?.error || `Server error: ${status}`,
      );
    } else if (error.request) {
      // Request made but no response
      console.error("❌ Network Error:");
      console.error("   Request:", error.request);
      console.error("   Message:", error.message);
      return Promise.reject("Network error. Please check your connection.");
    } else {
      // Something else happened
      console.error("❌ Error:", error.message);
      return Promise.reject(error.message || "An error occurred");
    }
  },
);
