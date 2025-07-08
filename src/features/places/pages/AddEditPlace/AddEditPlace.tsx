import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "./AddEditPlace.scss"
import { usePlacesContext } from '../../contexts/PlacesContext';
import { toast } from 'react-toastify';
import { Place } from '../../types/PlaceType'; // Asegúrate de que esta ruta sea correcta

export default function AddEditPlace() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [place, setPlace] = useState<Place>({
    title: "",
    description: "",
    shortDescription: "", 
    mapsUrl: "",
    imageUrl: "",
    city: ""
  });

  const [titleAddEdit, setTitleAddEdit] = useState<string>('Agregar');
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
      setTitleAddEdit('Editar');
      const fetchPlaceData = async () => {
        try {
          const response = await axios.get(`${apiUrl}/${placeId}`);
          if (response.data) {
            const placeSearched = response.data;
            setPlace(placeSearched);
          } else {
              console.warn('Place not found with id:', placeId);
              toast.error("Lugar no encontrado para editar.");
              navigate("/");
          }
        } catch (error) {
          console.error("Error fetching place data:", error);
          toast.error("Error al cargar los detalles del lugar para editar.");
          navigate("/");
        }
      };

      fetchPlaceData();
    } else {
      setPlace({
        title: "",
        description: "",
        shortDescription: "",
        mapsUrl: "",
        imageUrl: "",
        city: ""
      });
      setTitleAddEdit('Agregar');
      setErrors({}); // Limpiar errores si se cambia de editar a agregar
    }
  }, [location.pathname, apiUrl, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPlace(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let validationErrors: { [key: string]: string } = {};

    if (!place.title.trim()) {
      validationErrors.title = "Título no debe estar vacío.";
    }
    
    if (!place.shortDescription.trim()) {
      validationErrors.shortDescription = "Breve Descripción no debe estar vacío.";
    }
    if (!place.description.trim()) {
      validationErrors.description = "Descripción completa no debe estar vacía.";
    }
    // if (!place.mapsUrl.trim()) {
    //   validationErrors.mapsUrl = "Enlace de Google Maps no debe estar vacío.";
    // }
    if (!place.imageUrl.trim()) {
      validationErrors.imageUrl = "Enlace de Imagen no debe estar vacío.";
    }
    if (!place.city.trim()) {
      validationErrors.city = "Ciudad no debe estar vacía.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Por favor, corrige los errores del formulario.");
    } else {
      try {
        if (titleAddEdit === 'Editar') {
          await axios.put(`${apiUrl}/${id}`, place);
          updatePlace(place);
          toast.success("Lugar turístico actualizado.");
        } else {
          await axios.post(apiUrl, place);
          addPlace(place); // Idealmente, addPlace debería recibir el objeto con el _id del backend
          refetchPlaces();
          toast.success("Lugar turístico creado.");
        }
        setErrors({}); // Limpiar errores al enviar exitosamente
        navigate("/");
      } catch (error) {
        console.error("Error saving place data:", error);
        toast.error("Error al guardar o modificar lugar turístico.");
      }
    }
  }

  return (
    <div className="add-place-container">
      <div className="back-button">
        <Link to="/">
          <button className="secondary-button">Volver</button>
        </Link>
      </div>
      <div className="form-wrapper">
        {/* Aquí agregamos aria-labelledby para asociar el título con el formulario */}
        <form onSubmit={handleSubmit} className="place-form" aria-labelledby="form-title">
          {/* Añadimos un ID al h1 para aria-labelledby */}
          <h1 className="form-title" id="form-title">{titleAddEdit} Lugar Turístico</h1>

          {/* Campo Título */}
          <div className="form-field">
            {/* Indicador visual de campo obligatorio y htmlFor para accesibilidad */}
            <label htmlFor="title">Título: <span className="required-star">*</span></label>
            <input
              type="text"
              id="title"
              placeholder="Llene el título del lugar"
              name="title"
              value={place.title}
              onChange={handleChange}
              className={errors.title ? "input-error" : ""}
              aria-required="true" // ARIA: Indica que el campo es obligatorio
              aria-invalid={!!errors.title} // ARIA: Indica si el campo es inválido
              // ARIA: Asocia el campo con su mensaje de error si existe
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              // ARIA: id para ser referenciado por aria-describedby y role="alert" para anuncios inmediatos
              <div id="title-error" className="error-message" role="alert">
                {errors.title}
              </div>
            )}
          </div>

          {/* Nuevo campo: Breve Descripción */}
          <div className="form-field">
            <label htmlFor="shortDescription">Breve Descripción: <span className="required-star">*</span></label>
            <input
              type="text"
              id="shortDescription"
              placeholder="Una descripción corta del lugar"
              name="shortDescription" // Asegúrate de que este nombre coincida con tu tipo Place
              value={place.shortDescription}
              onChange={handleChange}
              className={errors.shortDescription ? "input-error" : ""}
              aria-required="true"
              aria-invalid={!!errors.shortDescription}
              aria-describedby={errors.shortDescription ? "shortDescription-error" : undefined}
            />
            {errors.shortDescription && (
              <div id="shortDescription-error" className="error-message" role="alert">
                {errors.shortDescription}
              </div>
            )}
          </div>

          {/* Campo Descripción Completa - Ahora un textarea */}
          <div className="form-field">
            <label htmlFor="description">Descripción Completa: <span className="required-star">*</span></label>
            <textarea
              id="description"
              placeholder="Llene la descripción detallada del lugar"
              name="description"
              value={place.description}
              onChange={handleChange}
              className={errors.description ? "input-error" : ""}
              rows={5}
              aria-required="true"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <div id="description-error" className="error-message" role="alert">
                {errors.description}
              </div>
            )}
          </div>

          {/* Campo Link Google Maps */}
          {/* <div className="form-field">
            <label htmlFor="mapsUrl">Link Google Maps: <span className="required-star">*</span></label>
            <input
              type="text"
              id="mapsUrl"
              placeholder="Ej: https://maps.app.goo.gl/abcdef123"
              name="mapsUrl"
              value={place.mapsUrl}
              onChange={handleChange}
              className={errors.mapsUrl ? "input-error" : ""}
              aria-required="true"
              aria-invalid={!!errors.mapsUrl}
              aria-describedby={errors.mapsUrl ? "mapsUrl-error" : undefined}
            />
            {errors.mapsUrl && (
              <div id="mapsUrl-error" className="error-message" role="alert">
                {errors.mapsUrl}
              </div>
            )}
          </div> */}

          {/* Campo Link Imagen */}
          <div className="form-field">
            <label htmlFor="imageUrl">Link Imagen: <span className="required-star">*</span></label>
            <input
              type="text"
              id="imageUrl"
              placeholder="Ej: https://example.com/imagen.jpg"
              name="imageUrl"
              value={place.imageUrl}
              onChange={handleChange}
              className={errors.imageUrl ? "input-error" : ""}
              aria-required="true"
              aria-invalid={!!errors.imageUrl}
              aria-describedby={errors.imageUrl ? "imageUrl-error" : undefined}
            />
            {errors.imageUrl && (
              <div id="imageUrl-error" className="error-message" role="alert">
                {errors.imageUrl}
              </div>
            )}
          </div>

          {/* Campo Ciudad */}
          <div className="form-field">
            <label htmlFor="city">Ciudad: <span className="required-star">*</span></label>
            <input
              type="text"
              id="city"
              placeholder="Ej: Guayaquil"
              name="city"
              value={place.city}
              onChange={handleChange}
              className={errors.city ? "input-error" : ""}
              aria-required="true"
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? "city-error" : undefined}
            />
            {errors.city && (
              <div id="city-error" className="error-message" role="alert">
                {errors.city}
              </div>
            )}
          </div>

          <button type="submit" className="primary-button">
            {titleAddEdit} Lugar
          </button>
        </form>
      </div>
    </div>
  );
}