import * as yup from 'yup';

// regex to validate image url
const imageUrlRegex = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i;

export const placeValidationSchema = yup.object().shape({
  title: yup.string()
    .required("Título no debe estar vacío.")
    .min(3, "El título debe tener al menos 3 caracteres."),
  shortDescription: yup.string()
    .required("Breve Descripción no debe estar vacío.")
    .min(10, "La breve descripción debe tener al menos 10 caracteres."),
  description: yup.string()
    .required("Descripción completa no debe estar vacía.")
    .min(20, "La descripción completa debe tener al menos 20 caracteres."),
  imageUrl: yup.string()
    .required("Enlace de Imagen no debe estar vacío.")
    .matches(imageUrlRegex, "El enlace de imagen no es válido o no termina en una extensión de imagen (.jpg, .png, etc.)."),
  city: yup.string()
    .required("Ciudad no debe estar vacía.")
    .min(2, "La ciudad debe tener al menos 2 caracteres."),
});