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
      validationErrors.title = "Title must not be empty.";
    }
    if (!place.description.trim()) {
      validationErrors.description = "Description must not be empty.";
    }
    if (!place.mapsUrl.trim()) {
      validationErrors.mapsUrl = "Maps URL must not be empty.";
    }
    if (!place.imageUrl.trim()) {
      validationErrors.imageUrl = "Image URL must not be empty.";
    }
    if (!place.city.trim()) {
      validationErrors.city = "City must not be empty.";
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
          <button>Back</button>
        </Link>
      </div>
      <div className="form">
        <form onSubmit={handleSubmit}>
          <h1 className='title'>{titleAddEdit} Place</h1>
          <div className="form-field">
            <label htmlFor="title">Title: </label>
            <input
              type="text"
              placeholder="Title"
              name="title"
              value={place.title}
              onChange={handleChange}
              
            />
            { errors.title && <div className="error">{errors.title}</div> }
          </div>
          <div className="form-field">
            <label htmlFor="description">Description: </label>
            <input
              type="text"
              placeholder="Description"
              name="description"
              value={place.description}
              onChange={handleChange}

            />
            { errors.description && <div className="error">{errors.description}</div> }
          </div>
          <div className="form-field">
            <label htmlFor="mapsUrl">Maps Url: </label>
            <input
              type="text"
              placeholder="Maps URL"
              name="mapsUrl"
              value={place.mapsUrl}
              onChange={handleChange}
      
            />
            { errors.mapsUrl && <div className="error">{errors.mapsUrl}</div> }
          </div>
          <div className="form-field">
            <label htmlFor="imageUrl">Image Url: </label>
            <input
              type="text"
              placeholder="Image URL"
              name="imageUrl"
              value={place.imageUrl}
              onChange={handleChange}
              
            />
            { errors.imageUrl && <div className="error">{errors.imageUrl}</div> }
          </div>
          <div className="form-field">
            <label htmlFor="city">City: </label>
            <input
              type="text"
              placeholder="City"
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