import axios from "axios";

export const fetchImages = async (): Promise<any[]> => {
  try {
    const response = await axios.get("/api/get-images");
    return response.data;
  } catch (error) {
    console.error("Error fetching images:", error);
    return [];
  }
};
