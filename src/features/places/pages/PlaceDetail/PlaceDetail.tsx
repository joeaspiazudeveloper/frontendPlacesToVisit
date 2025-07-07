import { Link } from 'react-router-dom';
import { Place } from '../../types/PlaceType';

import "./PlaceDetail.scss"

function PlaceDetail({ place }: {place: Place}) {
    if (!place) {
        return <div>No se pudo cargar el detalle del lugar.</div>;
    }

    return (
        <div className="place-detail">
            <div className="place-detail-maincontent">
                <img
                    src={`https://${place.imageUrl}`}
                    alt={place.title}
                    className="place-detail-image"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/images/malecon2000.jpg";
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

export default PlaceDetail;