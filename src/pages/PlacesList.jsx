import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../index.css";

export default function PlacesList() {
    const apiUrl = "https://backendplacetovisitecuador.onrender.com/places/";

    const [places, setPlaces] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const response = await axios.get(apiUrl);
                setPlaces(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchPlaces();
    }, []);

    const handleDelete = async (placeId) => {
        try {
            await axios.delete(apiUrl + placeId);
            setPlaces(places.filter(place => place.id !== placeId));
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <div className="add-place">
                <button>
                    <Link to="/addplace">Add Place</Link>
                </button>
            </div>
            <h1>Places to Visit in Ecuador</h1>
            <div className="place-list">
                {places.map((place) => (
                    <div className="place">
                        {place.imageUrl && (
                            <img src={place.imageUrl} alt={place.name} />
                        )}
                        <div className="place-body">
                            <h2>{place.title}</h2>
                            <p>{place.description}</p>
                        </div>
                        <div className="city">
                            <Link
                                to={`https://${place.mapsUrl}`}
                                target="_blank"
                                rel="link maps"
                            >
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
                ))}
            </div>
        </>
    );
}
