import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Place } from "../../types/PlaceType";
import PlaceItemSkeleton from "../../components/PlaceItemSkeleton";
import PlaceItem from "../../components/PlaceItem/PlaceItem";
import "./PlaceList.scss";
import { usePlacesContext } from "../../contexts/PlacesContext";
import SearchBar from "../../../../components/SearchBar/SearchBar";
import { toast } from "react-toastify";
import EtDialog from "../../../../shared/components/EtDialog/EtDialog";
import PlaceDetail from "../../pages/PlaceDetail/PlaceDetail";
import { useEffect, useState } from "react";

export default function PlacesList() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const { places, loading, error, removePlace, refetchPlaces } = usePlacesContext();
    const navigate = useNavigate();
    
    const { id } = useParams<{ id?: string }>();

    // State to hold the data for the place currently being viewed in the dialog
    const [selectedPlaceDetail, setSelectedPlaceDetail] = useState<Place | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    // useEffect to fetch place detail whenever the 'id' in the URL changes
    useEffect(() => {
        if (id) {
            setDetailLoading(true);
            setDetailError(null);
            const fetchPlaceDetail = async () => {
                try {
                    const response = await axios.get<Place>(`${apiUrl}/${id}`);
                    setSelectedPlaceDetail(response.data);
                } catch (err) {
                    console.error("Error fetching place detail:", err);
                    setDetailError("Error al cargar los detalles del lugar.");
                    toast.error("Error al cargar los detalles del lugar.");
                    setSelectedPlaceDetail(null); // Clear selected place on error
                } finally {
                    setDetailLoading(false);
                }
            };
            fetchPlaceDetail();
        } else {
            // If no ID in URL (e.g., navigated back to /places), clear the selected place
            setSelectedPlaceDetail(null);
        }
    }, [id, apiUrl]); // Depend on 'id' and 'apiUrl'

    // Function to close the detail dialog
    const handleCloseDetailDialog = () => {
        setSelectedPlaceDetail(null); // Clear the selected place state
        navigate('/places'); // Navigate back to the base /places URL, removing the :id
    };

    const handleDelete = async (placeId: string) => {
      if (!window.confirm("Estas seguro que deseas eliminar este lugar turistico?")) {
        return;
      }

      try {
        await axios.delete(`${apiUrl}/${placeId}`);
        removePlace(placeId);
        toast.warn("Lugar turistico eliminado.");
        
        // If the deleted item was the one currently in detail view, close the dialog
        if (id && id === placeId) {
            handleCloseDetailDialog(); // This will navigate to /places
        } else {
            // If not the detailed item, just ensure we are on the list view
            navigate("/places");
        }
        refetchPlaces(); // Refresh the list
      } catch (error) {
        toast.error("Error al eliminar el lugar turistico.");
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

        <SearchBar places={places} />

        <div className="add-place-btn-content">
          <button className="primary-button add-place-btn" onClick={redirectAddPlace}>
            <i className="fas fa-plus"></i> Agregar
          </button>
        </div>

        <div className="place-list">
          { places.length === 0 ? (
            <p>No places found</p>
          ) : (
            places.map((place: Place) =>
              (
                <PlaceItem place={place} key={place._id} onDelete={handleDelete} />
              )
            )
            
          )}
        </div>

        {/* Conditional rendering of the detail dialog */}
        {/* The dialog is rendered if an 'id' is present in the URL AND (it's loading, there's an error, or we have selectedPlaceDetail) */}
        {id && (detailLoading || detailError || selectedPlaceDetail) && (
            <EtDialog 
                isOpen={!!id} // Dialog is open if 'id' exists in the URL
                onClose={handleCloseDetailDialog} 
                title={detailLoading ? "Cargando..." : (selectedPlaceDetail?.title || "Detalle del Lugar")}
                slideFrom="right"
            >
                {detailLoading && <div>Cargando detalles...</div>}
                {detailError && <div>{detailError}</div>}
                {selectedPlaceDetail && <PlaceDetail place={selectedPlaceDetail} />}
                {/* Fallback for when id exists but data isn't found/loaded yet */}
                {!detailLoading && !detailError && !selectedPlaceDetail && <div>Lugar no encontrado.</div>}
            </EtDialog>
        )}
      </div>
    );
}