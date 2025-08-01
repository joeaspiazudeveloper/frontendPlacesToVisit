import { Link } from "react-router-dom";
import { Place } from "../../types/PlaceType";
import "./PlaceItem.scss";

export default function PlaceItem({ place, onDelete,}: {place: Place; onDelete: (placeId: string) => void;}) {
  return (
    <>
      <div className="place" key={place._id}>
        <div className="image-container">
          <Link to={`/places/${place._id}`}>
            <img
              src={place.imageUrl}
              alt={place.title}
              className="image"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/malecon2000.jpg";
              }}
            />
          </Link>
        </div>

        <div className="place-body">
          <h2>{place.title}</h2>
          <p>{place.shortDescription}</p>
        </div>
        <div className="city">
          <i className="fas fa-location-dot"></i>
          <span>{place.city}</span>
        </div>
        
        <div className="actions">
          <button
            className="delete"
            onClick={() => onDelete(place._id ? place._id : "")}
          >
            Eliminar
          </button>
          <button className="update">
            <Link to={`/addplace/${place._id}`}>Actualizar</Link>
          </button>
        </div>
      </div>
    </>
  );
}
