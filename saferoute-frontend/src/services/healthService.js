
const API_URL = "http://localhost:8081/api";

export const checkBackendHealth = async () => {
    try {
        const response = await fetch(`${API_URL}/health`);

        if (!response.ok) {
            throw new Error("Backend connection failed");
        }

        const data = await response.json();

        return data;

    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};
