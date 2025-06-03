import { Link } from "react-router-dom";
import { Place } from "../../types/PlaceType";
import "./PlaceItem.scss";
import { useState } from "react";
import PlaceDetail from "../../pages/PlaceDetail/PlaceDetail";
import EtDialog from "../../../../shared/components/et-dialog/et-dialog.tsx";

export default function PlaceItem({place, onDelete, isDetail}: {place: Place, 
    onDelete: (placeId: string) => void, isDetail: boolean}) {

    const [isShowDetailOpen, setisShowDetailOpen] = useState(false);

    const handleOpenDialogPlaceItem = () => {
        setisShowDetailOpen(true);
    }

    const handleCloseDialogPlaceItem = () => {
        setisShowDetailOpen(false);
    }

    return (
        <> 
            <div className="place" key={place._id}>
            <div className="image-container"> {/* Nuevo contenedor */}
                <a onClick={ handleOpenDialogPlaceItem }>
                    <img
                        src={`https://${place.imageUrl}`}
                        alt={place.title}
                        className="image" // Clase para la imagen
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/malecon2000.jpg";
                        }}
                    />
                </a>
            </div>
            
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
                        Eliminar
                    </button>
                    <button className="update">
                        <Link to={`/addplace/${place._id}`}>Actualizar</Link>
                    </button>
                </div>
            }
            </div>

            { isShowDetailOpen && 
                <EtDialog isOpen={isShowDetailOpen} 
                    onClose={handleCloseDialogPlaceItem} title={place.title}
                    slideFrom="right"
                >
                    <PlaceDetail place={place}></PlaceDetail>
                </EtDialog>
            }
        </>
        
    );
}