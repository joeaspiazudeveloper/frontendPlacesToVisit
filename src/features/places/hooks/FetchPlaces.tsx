import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function FetchPlaces(apiUrl: string) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlacesData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(apiUrl);
      if (response.data && !response.data.fatal) {
        setPlaces(response.data);
      } else {
        const errorMessage = response.data?.message || "Failed to load places due to invalid data.";
        toast.error(errorMessage);
        setError(errorMessage);
        console.error("API Error:", errorMessage);
      }
    } catch (error) {
      console.error("Error getting data:", error);
      let userFriendlyMessage = "An unexpected error occurred while loading places. Please try again later.";
      if (axios.isAxiosError(error)) {
        if (error.response) {
          userFriendlyMessage = `Server error: ${error.response.status} - ${error.response.data?.message || 'Something went wrong on the server.'}`;
          console.error("Server Response:", error.response);
        } else if (error.request) {
          userFriendlyMessage = "Network error: Could not connect to the server. Please check your internet connection.";
        } else {
          userFriendlyMessage = `Request error: ${error.message}`;
        }
      }

      toast.error(userFriendlyMessage);

      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlacesData();
    }, 2000);

    return () => clearTimeout(timer);
  }, [apiUrl]);

  return { places, loading, error, setPlaces, fetchPlacesData };
}