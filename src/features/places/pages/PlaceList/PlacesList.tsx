import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Place } from "../../types/PlaceType";
import  fetchPlaces  from "../../hooks/FetchPlaces";
import PlaceItemSkeleton from "../../components/PlaceItemSkeleton";
import PlaceItem from "../../components/PlaceItem/PlaceItem";
import "./PlaceList.scss";


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

    const redirectAddPlace = () => {
      navigate("/addplace");
    }
  
    if (loading) {
      return (
        <div className="place-list">
          {Array.from({ length: 3 }).map((_, index) => (
            <PlaceItemSkeleton key={index} />
          ))}
        </div>
      );
    };
    if (error) return <p className="error">{error}</p>;
  
    return (
      <div className="place-list-container">
        <div className="add-place-btn-content">
          <button className="primary-button add-place-btn" onClick={ redirectAddPlace }>Add Place</button>
        </div>
        <div className="place-list">
          {places.length === 0 ? (
            <p>No places found</p>
          ) : (
            places.map((place: Place) => <PlaceItem place={place} key={place._id} onDelete={handleDelete} isDetail={true}   />)
          )}
        </div>
      </div>
    );
}
