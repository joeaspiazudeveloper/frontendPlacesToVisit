import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "./AddEditPlace.scss"
import { usePlacesContext } from '../../contexts/PlacesContext';
import { toast } from 'react-toastify';

interface Place {
  _id?: string
  title: string;
  description: string;
  mapsUrl: string;
  imageUrl: string;
  city: string;
}

export default function AddPlace() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [place, setPlace] = useState<Place>({
    title: "",
    description: "",
    mapsUrl: "",
    imageUrl: "",
    city: ""
  });

  const [titleAddEdit, setTitleAddEdit] = useState<string>('Add');
  const [id, setId] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { addPlace, updatePlace, refetchPlaces } = usePlacesContext();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryId = location.pathname.split("/")[2];
    const placeId = queryId ? queryId : '0';
    setId(placeId);

    if (placeId !== '0') {
      setTitleAddEdit('Edit');
      const fetchPlaceData = async () => {
        try {
          const response = await axios.get(apiUrl);
          if (response) {
            const places = response.data;
            const placeSearched = places.find((place: Place) => place._id === placeId);
            if (placeSearched) {
              setPlace(placeSearched);
            } else {
              console.warn('Place not found with id:', placeId);
            }
          }
        } catch (error) {
          console.error("Error fetching place data:", error);
        }
      };

      fetchPlaceData();
    }
  }, [location.pathname]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlace(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación de errores
    let validationErrors: { [key: string]: string } = {};

    if (!place.title.trim()) {
      validationErrors.title = "Titulo no debe estar vacio.";
    }
    if (!place.description.trim()) {
      validationErrors.description = "Descripcion no debe estar vacio.";
    }
    if (!place.mapsUrl.trim()) {
      validationErrors.mapsUrl = "Link de Google Maps no debe estar vacio.";
    }
    if (!place.imageUrl.trim()) {
      validationErrors.imageUrl = "Link Imagen no debe estar vacio.";
    }
    if (!place.city.trim()) {
      validationErrors.city = "Ciudad no debe estar vacio.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        if (titleAddEdit === 'Edit') {
          await axios.put(`${apiUrl}/${id}`, place);
          updatePlace(place);
          toast.success("Lugar turistico actualizado.");
        } else {
          await axios.post(apiUrl, place);
          addPlace(place);
          refetchPlaces();
          toast.success("Lugar turistico creado.");
        }
        navigate("/");
      } catch (error) {
        console.error("Error saving place data:", error);
      }
      setErrors({});
    }
  }

  return (
    <div className="add-place">
      <div className="back-button">
        <Link to="/">
          <button>Volver</button>
        </Link>
      </div>
      <div className="form">
        <form onSubmit={handleSubmit}>
          <h1 className='title'>{titleAddEdit} Lugar Turistico</h1>
          <div className="form-field">
            <label htmlFor="title">Titulo: </label>
            <input
              type="text"
              placeholder="Llene titulo"
              name="title"
              value={place.title}
              onChange={handleChange}
              
            />
            { errors.title && <div className="error">{errors.title}</div> }
          </div>
          <div className="form-field">
            <label htmlFor="description">Descripcion: </label>
            <input
              type="text"
              placeholder="Llene descripcion"
              name="description"
              value={place.description}
              onChange={handleChange}

            />
            { errors.description && <div className="error">{errors.description}</div> }
          </div>
          <div className="form-field">
            <label htmlFor="mapsUrl">Link Google Maps: </label>
            <input
              type="text"
              placeholder="Llene el link de google maps"
              name="mapsUrl"
              value={place.mapsUrl}
              onChange={handleChange}
      
            />
            { errors.mapsUrl && <div className="error">{errors.mapsUrl}</div> }
          </div>
          <div className="form-field">
            <label htmlFor="imageUrl">Link Imagen: (sin https)</label>
            <input
              type="text"
              placeholder="Llene el link de imagen"
              name="imageUrl"
              value={place.imageUrl}
              onChange={handleChange}
              
            />
            { errors.imageUrl && <div className="error">{errors.imageUrl}</div> }
          </div>
          <div className="form-field">
            <label htmlFor="city">Ciudad: </label>
            <input
              type="text"
              placeholder="Llene ciudad"
              name="city"
              value={place.city}
              onChange={handleChange}
              
            />
            { errors.city && <div className="error">{errors.city}</div> }
          </div>
          <button type="submit">{titleAddEdit} Place</button>
        </form>
      </div>
    </div>
  );
}