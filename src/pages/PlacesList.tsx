import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../index.scss";
import placeData from "../data/places.json";

export default function PlacesList() {
    
   const apiUrl = import.meta.env.VITE_API_URL;
   const placeListDemo = placeData;

   const [places, setPlaces] = useState<Array<{ id: number; title: string; description: string; imageUrl: string; mapsUrl: string; city: string }>>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const navigate = useNavigate();

   useEffect(() => {
       const fetchPlaces = async () => {
           try {
               const response = await axios.get(apiUrl);
               if (response.data && !response.data.fatal) {
                   setPlaces(response.data);
               } else {
                   setPlaces(placeListDemo);
                   throw new Error("Invalid data received from API");
               }
           } catch (error) {
               console.error("Error getting data:", error);
               setError("Failed to load places. Please try again later.");
               setPlaces(placeListDemo);
           } finally {
               setLoading(false);
           }
       };
       fetchPlaces();
   }, [apiUrl]);

   const handleDelete = async (placeId: number) => {
       try {
           await axios.delete(`${apiUrl}/${placeId}`);
           setPlaces(places.filter((place) => place.id !== placeId));
           navigate("/");
       } catch (error) {
           console.log(error);
       }
   };

   return (
       <>
           <h3 className="title">Places to Visit</h3>
           {error && <p className="error">{error} Showing Demo Data</p>}
           <div className="place-list">
               {loading ? (
                   <p>Loading...</p>
               ) : places.length === 0 ? (
                   <p>No places found</p>
               ) : (
                   places.map((place) => (
                       <div className="place" key={place.id}>
                           <img
                               src={`https://${place.imageUrl}`}
                               alt={place.title}
                               onError={(e) => {
                                   e.currentTarget.onerror = null;
                                   e.currentTarget.src = "/images/malecon2000.jpg";
                               }}
                           />
                           <div className="place-body">
                               <h2>{place.title}</h2>
                               <p>{place.description}</p>
                           </div>
                           <div className="city">
                               <Link to={`https://${place.mapsUrl}`} target="_blank" rel="noopener noreferrer">
                                   <i className="fas fa-location-dot"></i>
                               </Link>
                               <span>{place.city}</span>
                           </div>
                           <div className="actions">
                               <button className="delete" onClick={() => handleDelete(place.id)}>
                                   Remove
                               </button>
                               <button className="update">
                                   <Link to={`/addplace/${place.id}`}>Update</Link>
                               </button>
                           </div>
                       </div>
                   ))
               )}
           </div>
       </>
   );
}
