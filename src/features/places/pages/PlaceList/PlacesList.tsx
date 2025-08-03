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
  const apiUrl = import.meta.env.VITE_API_URL + "/places";
  const { places, loading, error, removePlace, refetchPlaces } = usePlacesContext();
  const navigate = useNavigate();

  const { id } = useParams<{ id?: string }>();

  const [selectedPlaceDetail, setSelectedPlaceDetail] = useState<Place | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [selectedPlaceToDelete, setSelectedPlaceToDelete] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState(false);

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
          setSelectedPlaceDetail(null);
        } finally {
          setDetailLoading(false);
        }
      };
      fetchPlaceDetail();
    } else {
      setSelectedPlaceDetail(null);
    }
  }, [id, apiUrl]);

  // Function to close the detail dialog
  const handleCloseDetailDialog = () => {
    setSelectedPlaceDetail(null);
    navigate("/places");
  };

  // function to close the delete dialog
  const handleCloseDeleteDialog = () => {
    setSelectedPlaceToDelete('');
  };
  
  const handleDelete = async (placeId: string) => {
    try {
      setDeleteLoading(true);
      await axios.delete(`${apiUrl}/${placeId}`);
      removePlace(placeId);
      toast.warn("Lugar turistico eliminado.");
      setSelectedPlaceToDelete('');
      setDeleteLoading(false);
      refetchPlaces(); // Refresh the list
    } catch (error) {
      toast.error("Error al eliminar el lugar turistico.");
      console.log(error);
    }
  };

  const redirectAddPlace = () => {
    navigate("/addplace");
  };



  if (loading) {
    return (
      <div className="place-list">
        {Array.from({ length: 3 }).map((_, index) => (
          <PlaceItemSkeleton key={index} />
        ))}
      </div>
    );
  }
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="place-list-container">
      <SearchBar places={places} />

      <div className="add-place-btn-content">
        <button
          className="primary-button add-place-btn"
          onClick={redirectAddPlace}
        >
          <i className="fas fa-plus"></i> Agregar
        </button>
      </div>

      <div className="place-list">
        {places.length === 0 ? (
          <p>No places found</p>
        ) : (
          places.map((place: Place) => (
            <PlaceItem place={place} key={place._id} onDelete={() => setSelectedPlaceToDelete(place._id || '')} />
          ))
        )}
      </div>
      {/* Detail of place */}
      {id && (detailLoading || detailError || selectedPlaceDetail) && (
        <EtDialog
          isOpen={!!id}
          onClose={handleCloseDetailDialog}
          title={
            detailLoading
              ? "Cargando..."
              : selectedPlaceDetail?.title || "Detalle del Lugar"
          }
          slideFrom="right"
        >
          {detailLoading && <div>Cargando detalles...</div>}
          {detailError && <div>{detailError}</div>}
          {selectedPlaceDetail && <PlaceDetail place={selectedPlaceDetail} />}
          {/* Fallback for when id exists but data isn't found/loaded yet */}
          {!detailLoading && !detailError && !selectedPlaceDetail && (
            <div>Lugar no encontrado.</div>
          )}
        </EtDialog>
      )}

      { /* Delete dialog */}
      { selectedPlaceToDelete!=='' && (
        <EtDialog
          isOpen={!!selectedPlaceToDelete}
          onClose={() => setSelectedPlaceToDelete('')}
          title="Eliminar lugar turistico?"
          className="delete-place-dialog"
          
        >
          <div className="delete-place-dialog-content">
            <p>
              { deleteLoading ? 
                "Eliminando..." : 
                "Estas seguro que deseas eliminar este lugar turistico?"}
            </p>
            <div className="delete-place-dialog-content__actions">
              <button className="primary-button" onClick={() => handleDelete(selectedPlaceToDelete)}>
                Si
              </button>
              <button className="secondary-button" onClick={handleCloseDeleteDialog}>
                No
              </button>
            </div>
          </div>
       
      </EtDialog>
    )
  }
    </div>
  );
}
