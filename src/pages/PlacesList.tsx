import { useNavigate } from "react-router-dom";
import fetchPlaces from "../hooks/FetchPlaces";
import "../index.scss";
import axios from "axios";
import PlaceItem from "../components/PlaceItem";
import { Place } from "../types/PlaceType";

export default function PlacesList() {
    
    const apiUrl = import.meta.env.VITE_API_URL;
    const { places, loading, error, setPlaces } = fetchPlaces(apiUrl);
    const navigate = useNavigate();

    const handleDelete = async (placeId: string) => {
      try {
        await axios.delete(`${apiUrl}/${placeId}`);
        setPlaces((prevPlaces) => prevPlaces.filter((place: Place) => place._id !== placeId));
        navigate("/");
      } catch (error) {
        console.log(error);
      }
    };
  
    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;
  
    return (
      <>
        <div className="place-list">
          {places.length === 0 ? (
            <p>No places found</p>
          ) : (
            places.map((place: Place) => <PlaceItem place={place} key={place._id} onDelete={handleDelete} isDetail={true}   />)
          )}
        </div>
      </>
    );
}
