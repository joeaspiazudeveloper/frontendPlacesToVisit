import { Link } from "react-router-dom";
import { Place } from "../../types/PlaceType";
import "./PlaceItem.scss";

export default function PlaceItem({place, onDelete, isDetail}: {place: Place, 
    onDelete: (placeId: string) => void, isDetail: boolean}) { 


    return (
        <div className="place" key={place._id}>
            <Link to={`/places/${place._id}`}>
                <img
                    src={`https://${place.imageUrl}`}
                    alt={place.title}
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/images/malecon2000.jpg";
                    }}
                />
            </Link>
            
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
            { isDetail && 
                <div className="actions">
                    <button className="delete" onClick={() => onDelete(place._id ? place._id : '')}>
                        Remove
                    </button>
                    <button className="update">
                        <Link to={`/addplace/${place._id}`}>Update</Link>
                    </button>
                </div>
            }
        </div>
    );
}