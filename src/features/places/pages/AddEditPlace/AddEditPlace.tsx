import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { placeValidationSchema } from '../../validations/placeValidationSchema';

import "./AddEditPlace.scss";
import { usePlacesContext } from '../../contexts/PlacesContext';
import { toast } from 'react-toastify';
import { Place } from '../../types/PlaceType'; // Asegúrate de que esta ruta sea correcta

type FormData = Place;

export default function AddEditPlace() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const {
    register,
    handleSubmit,
    setValue,
    watch,   
    formState: { errors, isSubmitting }, 
    reset 
  } = useForm<FormData>({
    resolver: yupResolver(placeValidationSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      imageUrl: "",
      city: ""
    }
  });

  const [titleAddEdit, setTitleAddEdit] = useState<string>('Agregar');
  const [id, setId] = useState<string>("");

  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');

  const { addPlace, updatePlace, refetchPlaces } = usePlacesContext();

  const navigate = useNavigate();
  const location = useLocation();

  const imageUrlWatch = watch('imageUrl');
  useEffect(() => {
    if (imageUrlWatch && imageUrlWatch.trim()) {
     // validate imageUrl
      const isValidUrlFormat = /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(imageUrlWatch);
      if (isValidUrlFormat) {
        setPreviewImageUrl(imageUrlWatch);
      } else {
        setPreviewImageUrl('');
      }
    } else {
      setPreviewImageUrl('');
    }
  }, [imageUrlWatch]);

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
            reset(placeSearched); 
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
     // reset the form
      reset();
      setTitleAddEdit('Agregar');
    }
  }, [location.pathname, apiUrl, navigate, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    // data contains the form values
    try {
      if (titleAddEdit === 'Editar') {
        await axios.put(`${apiUrl}/${id}`, data);
        updatePlace(data);
        toast.success("Lugar turístico actualizado.");
      } else {
        await axios.post(apiUrl, data);
        addPlace(data);
        refetchPlaces();
        toast.success("Lugar turístico creado.");
      }
      navigate("/");
    } catch (error) {
      console.error("Error saving place data:", error);
      toast.error("Error al guardar o modificar lugar turístico.");
    }
  };

  return (
    <div className="add-place-container">
      <div className="back-button">
        <Link to="/">
          <button className="secondary-button">Volver</button>
        </Link>
      </div>
      <div className="form-wrapper">
       
        <form onSubmit={handleSubmit(onSubmit)} className="place-form" aria-labelledby="form-title">
          <h1 className="form-title" id="form-title">{titleAddEdit} Lugar Turístico</h1>

          <div className="form-field">
            <label htmlFor="title">Título: <span className="required-star">*</span></label>
            <input
              type="text"
              id="title"
              placeholder="Llene el título del lugar"
              {...register("title")}
              className={errors.title ? "input-error" : ""}
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <div id="title-error" className="error-message" role="alert">
                {errors.title.message}
              </div>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="shortDescription">Breve Descripción: <span className="required-star">*</span></label>
            <input
              type="text"
              id="shortDescription"
              placeholder="Una descripción corta del lugar"
              {...register("shortDescription")}
              className={errors.shortDescription ? "input-error" : ""}
              aria-required="true"
              aria-invalid={!!errors.shortDescription}
              aria-describedby={errors.shortDescription ? "shortDescription-error" : undefined}
            />
            {errors.shortDescription && (
              <div id="shortDescription-error" className="error-message" role="alert">
                {errors.shortDescription.message}
              </div>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="description">Descripción Completa: <span className="required-star">*</span></label>
            <textarea
              id="description"
              placeholder="Llene la descripción detallada del lugar"
              {...register("description")}
              className={errors.description ? "input-error" : ""}
              rows={5}
              aria-required="true"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <div id="description-error" className="error-message" role="alert">
                {errors.description.message}
              </div>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="imageUrl">Link Imagen: <span className="required-star">*</span></label>
            <input
              type="text"
              id="imageUrl"
              placeholder="Ej: https://example.com/image.jpg (con vista previa)"
              {...register("imageUrl")}
              className={errors.imageUrl ? "input-error" : ""}
              aria-required="true"
              aria-invalid={!!errors.imageUrl}
              aria-describedby={errors.imageUrl ? "imageUrl-error" : undefined}
            />
            {errors.imageUrl && (
              <div id="imageUrl-error" className="error-message" role="alert">
                {errors.imageUrl.message}
              </div>
            )}

          
            {previewImageUrl && !errors.imageUrl && ( 
              <div className="image-preview-container" style={{ marginTop: '15px' }}>
                <p>Vista previa:</p>
                <img
                  src={previewImageUrl}
                  alt="Vista previa de la imagen"
                  className="image-preview"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    setPreviewImageUrl('');
                    toast.error("No se pudo cargar la vista previa de la imagen. Verifica la URL.");
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="city">Ciudad: <span className="required-star">*</span></label>
            <input
              type="text"
              id="city"
              placeholder="Ej: Guayaquil"
              {...register("city")}
              className={errors.city ? "input-error" : ""}
              aria-required="true"
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? "city-error" : undefined}
            />
            {errors.city && (
              <div id="city-error" className="error-message" role="alert">
                {errors.city.message}
              </div>
            )}
          </div>

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : `${titleAddEdit}`}
          </button>
        </form>
      </div>
    </div>
  );
}