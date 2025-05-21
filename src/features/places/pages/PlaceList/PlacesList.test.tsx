import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import PlacesList from './PlacesList';

// Importa el tipo Place si lo necesitas para tipar tus mocks de datos
// (Asegúrate de que la ruta sea correcta según tu PlaceType.tsx)
import { Place } from '../../types/PlaceType';

// --- SECCIÓN DE MOCKS ---
// Esta sección va al inicio del archivo de prueba, ANTES de cualquier `describe` o `test`.
// Los mocks se aplican a todo el archivo de prueba.

// 1. Mockear react-router-dom
//  - jest.fn() crea una función "mockeada" que Jest puede rastrear.
//  - `__esModule: true` es importante para mockear módulos con exportaciones por defecto de ES6.
jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: jest.fn(), // Mockeamos useNavigate para que no haga nada real
}));

// 2. Mockear el contexto de PlacesContext
//  - Creamos un objeto que simula el valor que el contexto `usePlacesContext` devolvería.
//  - Lo definimos aquí para poder modificarlo en cada prueba usando `beforeEach` o directamente.
const mockPlacesContextValue = {
  places: [] as Place[], // Array de lugares, tipado con Place[]
  loading: false, // Estado de carga inicial
  error: null, // Estado de error inicial
  removePlace: jest.fn(), // Funciones mockeadas para simular su comportamiento
  refetchPlaces: jest.fn(),
};

//  - Le decimos a Jest que cuando alguien importe 'PlacesContext', use nuestro mock.
jest.mock('../../contexts/PlacesContext', () => ({
  usePlacesContext: () => mockPlacesContextValue, // Retorna nuestro objeto mockeado
}));

// 3. Mockear las variables de entorno de Vite (import.meta.env)
//  - Jest se ejecuta en Node.js, no en el navegador ni con Vite.
//  - Esto simula el objeto `import.meta.env` para que `apiUrl` no sea `undefined`.
Object.defineProperty(global, 'import', {
  configurable: true,
  value: {
    meta: {
      env: {
        VITE_API_URL: "http://mock-api.com/places", // Un URL base de API mockeado
      },
    },
  },
});

// 4. Mockear react-toastify
//  - Evita que las notificaciones reales aparezcan durante las pruebas.
jest.mock('react-toastify', () => ({
  toast: {
    warn: jest.fn(),
    error: jest.fn(),
    // Puedes añadir otros métodos de toast que uses, como info, success, etc.
  },
}));

// 5. Mockear Componentes Hijos
//  - Reemplazamos los componentes hijos (`PlaceItem`, `PlaceItemSkeleton`, `SearchBar`)
//    con `div`s simples que tienen un `data-testid`.
//  - Esto aisla la prueba a `PlacesList` y previene que los hijos carguen sus propias
//    dependencias, css, etc., haciendo la prueba más rápida y enfocada.
jest.mock('../../components/PlaceItem/PlaceItem', () => ({
  __esModule: true,
  default: jest.fn((props: any) => <div data-testid="mock-place-item" {...props} />),
}));

jest.mock('../../components/PlaceItemSkeleton', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="mock-place-item-skeleton" />),
}));

jest.mock('../../../../components/SearchBar/SearchBar', () => ({
  __esModule: true,
  default: jest.fn((props: any) => <div data-testid="mock-search-bar" {...props} />),
}));


// --- INICIO DE LAS PRUEBAS ---
describe('PlacesList', () => {

  // beforeEach se ejecuta antes de CADA prueba (`test`) dentro de este `describe`.
  // Es crucial para reiniciar el estado de los mocks para que cada prueba sea independiente.
  beforeEach(() => {
    // Limpia cualquier llamada anterior a funciones mockeadas
    jest.clearAllMocks();

    // Reinicia el valor del mock de contexto a su estado por defecto
    mockPlacesContextValue.places = [];
    mockPlacesContextValue.loading = false;
    mockPlacesContextValue.error = null;
    // También reinicia las funciones mockeadas dentro del contexto
    mockPlacesContextValue.removePlace.mockClear();
    mockPlacesContextValue.refetchPlaces.mockClear();
  });

  // PRUEBA 1: Verificar el mensaje "No places found"
  test('renders "No places found" when no places are available', () => {
    // 1. Renderiza el componente `PlacesList` en el entorno de prueba.
    render(<PlacesList />);

    // 2. Busca el texto "No places found" en el DOM renderizado.
    //    `screen.getByText` es una consulta de React Testing Library que simula cómo un usuario
    //    encontraría el texto en la pantalla. `/no places found/i` es una expresión regular
    //    para buscar el texto sin importar mayúsculas/minúsculas.
    const noPlacesMessage = screen.getByText(/no places found/i);

    // 3. Afirma que el elemento encontrado está presente en el documento.
    //    `toBeInTheDocument()` es un matcher de `@testing-library/jest-dom` que hace la aserción.
    expect(noPlacesMessage).toBeInTheDocument();
  });

  // PRUEBA 2: Verificar que el botón "Agregar Lugar Turistico" se renderiza
  test('renders the "Agregar Lugar Turistico" button', () => {
    // 1. Renderiza el componente `PlacesList`.
    render(<PlacesList />);

    // 2. Busca el botón por su "rol" de accesibilidad ('button') y su "nombre" (el texto visible).
    //    `screen.getByRole` es preferible ya que simula cómo un usuario con tecnologías de
    //    asistencia encontraría el elemento.
    const addButton = screen.getByRole('button', { name: /agregar lugar turistico/i });

    // 3. Afirma que el botón está presente en el documento.
    expect(addButton).toBeInTheDocument();
  });

  // Puedes añadir más pruebas aquí en el futuro...
});