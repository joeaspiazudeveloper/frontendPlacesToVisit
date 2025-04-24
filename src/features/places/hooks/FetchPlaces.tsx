import { useState, useEffect } from "react";
import axios from "axios";

export default function FetchPlaces(apiUrl: string) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get(apiUrl);
        if (response.data && !response.data.fatal) {
          setPlaces(response.data);
        } else {
          throw new Error("Invalid data received from API");
        }
      } catch (error) {
        console.error("Error getting data:", error);
        setError("Failed to load places. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, [apiUrl]);

  return { places, loading, error, setPlaces };
}