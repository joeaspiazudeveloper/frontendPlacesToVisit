import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../index.css";

export default function PlacesList() {
    
    const apiUrl = import.meta.env.VITE_API_URL;

    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        // using setTimeOut for development purpose we can remove it
        setTimeout(() => {
            const fetchPlaces = async () => {
                try {
                    const response = await axios.get(apiUrl);
                    if (response.data && !response.data.fatal) {
                        setPlaces(response.data);
                    } else {
                        throw new Error("Invalid data received from API");
                    }
                    setPlaces(response.data);
                } catch (error) {
                    console.log('Error getting data', [error]);
                } finally {
                    setLoading(false);
                }
            };
            fetchPlaces();
        }, 2000)

    }, []);

    const handleDelete = async (placeId) => {
        try {
            await axios.delete(apiUrl + placeId);
            setPlaces(places.filter((place) => place.id !== placeId));
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <h3 className="title">Places to Visit in Ecuador</h3>
            {error && <p className="error">{error}</p>}
            <div className="place-list">
                {
                    loading ? (
                        <p>Loading...</p>
                    ) :
                        (places.length === 0 && !loading) ? (
                            <p>No places found</p>
                        ) : (
                            places.map((place) => (
                                <div className="place" key={place.id}>
                                    <img src={place.imageUrl} alt={place.name} />
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
                                        <button
                                            className="delete"
                                            onClick={() => handleDelete(place.id)}
                                        >
                                            Remove
                                        </button>
                                        <button className="update">
                                            <Link to={`/addplace/${place.id}`}>Update</Link>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                }
            </div>
        </>

    );
}
