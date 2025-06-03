import { use, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Place } from '../../types/PlaceType';
import PlaceItem from '../../components/PlaceItem/PlaceItem';

import "./PlaceDetail.scss"

function PlaceDetail({ place }: {place: Place}) {
    console.log(place._id);
    return (
        <div className="place-detail">
            <div className="place-detail-maincontent">
                <img
                    src={`https://${place.imageUrl}`}
                    alt={place.title}
                    className="place-detail-image" // Asume una clase para la imagen de detalle
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/images/malecon2000.jpg"; // Imagen de fallback
                    }}
                />
                <h2>{place.title}</h2>
                <p><strong>Descripción:</strong> {place.description}</p>
                <p><strong>Ciudad:</strong> {place.city}</p>
                <p>
                    <strong>Ubicación en mapa:</strong> 
                    <Link to={`https://${place.mapsUrl}`} target="_blank" rel="noopener noreferrer">
                        Ver en Mapas <i className="fas fa-external-link-alt"></i>
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default PlaceDetail