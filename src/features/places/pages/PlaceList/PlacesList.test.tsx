import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlacesList from './PlacesList';
import { usePlacesContext } from '../../contexts/PlacesContext';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Place } from '../../types/PlaceType';

// --- DECLARACIÓN GLOBAL PARA MOCKEAR import.meta.env ---
// Esto le dice a TypeScript que `global` tendrá la propiedad `import.meta.env`
// que normalmente Vite inyecta en el cliente.
declare global {
  namespace NodeJS {
    interface Global {
      import: {
        meta: {
          env: {
            VITE_API_URL: string;
          };
        };
      };
    }
  }
}

// ********** CORRECCIÓN CLAVE: Mover la inicialización de global.import.meta.env aquí **********
// Esto asegura que VITE_API_URL esté definida antes de que cualquier módulo que la use sea importado.
(global as any).import = {
  meta: {
    env: {
      VITE_API_URL: 'http://mockapi.com/places', // URL mockeada para tus pruebas
    },
  },
};
// ************************************************************************************************

// --- MOCKS NECESARIOS ---

// 1. Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

// 2. Mock de axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// 3. Mock de react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));
const mockedToast = toast as jest.Mocked<typeof toast>;

// 4. Mock de usePlacesContext
jest.mock('../../contexts/PlacesContext', () => ({
  usePlacesContext: jest.fn(),
}));
const mockedUsePlacesContext = usePlacesContext as jest.MockedFunction<typeof usePlacesContext>;

// 5. Mock de window.confirm
const mockWindowConfirm = jest.spyOn(window, 'confirm');

// --- Mocking Child Components (Opcional pero recomendado para tests unitarios) ---
jest.mock('../../components/PlaceItem/PlaceItem', () => {
  return ({ place, onDelete }: { place: Place; onDelete: (id: string) => void }) => (
    <div data-testid={`place-item-${place._id}`}>
      <h3>{place.title}</h3>
      <p>{place.shortDescription}</p>
      <button onClick={() => onDelete(place._id || '')}>Eliminar {place.title}</button>
      <a href={`/places/${place._id}`} data-testid={`place-detail-link-${place._id}`}>Ver Detalle</a>
    </div>
  );
});
jest.mock('../../components/PlaceItemSkeleton', () => () => <div data-testid="place-item-skeleton">Loading Place...</div>);
jest.mock('../../../../components/SearchBar/SearchBar', () => ({ places }: { places: Place[] }) => (
  <div data-testid="search-bar">Search Bar {places.length} places</div>
));
jest.mock('../../../../shared/components/EtDialog/EtDialog', () => {
  return ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
    isOpen ? (
      <div data-testid="et-dialog">
        <h2>{title}</h2>
        <button onClick={onClose}>Cerrar Diálogo</button>
        {children}
      </div>
    ) : null
  );
});
jest.mock('../../pages/PlaceDetail/PlaceDetail', () => ({ place }: { place: Place }) => (
  <div data-testid="place-detail-component">
    <h3>Detalle de {place.title}</h3>
    <p>{place.description}</p>
  </div>
));

// --- CONSTANTES / DATOS DE PRUEBA ---
const mockPlaces: Place[] = [
  { _id: '1', title: 'Lugar 1', description: 'Desc 1', shortDescription: 'Short 1', imageUrl: 'url1.jpg', city: 'Ciudad 1' },
  { _id: '2', title: 'Lugar 2', description: 'Desc 2', shortDescription: 'Short 2', imageUrl: 'url2.jpg', city: 'Ciudad 2' },
];

const mockNavigate = jest.fn();
const mockUseParams = useParams as jest.Mock;

// Spies para console.error/log para suprimir la salida durante los tests
// Estos spies se encargan de que no veas los mensajes de consola en el output de Jest,
// a menos que un test falle y Jest los reporte como parte del fallo.
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('PlacesList', () => {
  // --- Limpieza antes de cada prueba ---
  beforeEach(() => {
    // Resetear todos los mocks antes de cada test para asegurar un estado limpio
    mockedUsePlacesContext.mockReset();
    mockedAxios.get.mockReset();
    mockedAxios.delete.mockReset();
    mockedToast.success.mockReset();
    mockedToast.error.mockReset();
    mockedToast.warn.mockReset();
    mockNavigate.mockReset();
    mockUseParams.mockReset();
    mockWindowConfirm.mockReset();

    // NOTA: global.import.meta.env se inicializa una vez al inicio del archivo,
    // por lo que no es necesario resetearlo aquí en beforeEach.

    // Configurar el mock de useNavigate para todas las pruebas por defecto
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    // Configurar el mock de useParams para que por defecto no haya ID
    mockUseParams.mockReturnValue({});

    // ********** Configurar el mock por defecto para usePlacesContext (estado feliz) **********
    mockedUsePlacesContext.mockReturnValue({
      places: mockPlaces,
      loading: false,
      error: '',
      removePlace: jest.fn(),
      refetchPlaces: jest.fn(),
      updatePlace: jest.fn(),
      addPlace: jest.fn(),
    });
  });

  // --- Limpieza después de cada prueba ---
  afterEach(() => {
    consoleErrorSpy.mockRestore(); // Restaura console.error después de cada test
    consoleLogSpy.mockRestore();   // Restaura console.log
  });

  // --- ESCENARIOS DE PRUEBA ---

  test('renders loading skeletons when loading is true', () => {
    mockedUsePlacesContext.mockReturnValue({
      places: [],
      loading: true, // Simula estado de carga
      error: '',
      removePlace: jest.fn(),
      refetchPlaces: jest.fn(),
      updatePlace: jest.fn(),
      addPlace: jest.fn(),
    });

    render(<PlacesList />);

    expect(screen.getAllByTestId('place-item-skeleton')).toHaveLength(3);
    expect(screen.queryByText('No places found')).not.toBeInTheDocument();
  });

  test('renders error message when there is an error', () => {
    mockedUsePlacesContext.mockReturnValue({
      places: [],
      loading: false,
      error: 'Failed to fetch places.', // Simula un error
      removePlace: jest.fn(),
      refetchPlaces: jest.fn(),
      updatePlace: jest.fn(),
      addPlace: jest.fn(),
    });

    render(<PlacesList />);

    expect(screen.getByText('Failed to fetch places.')).toBeInTheDocument();
    expect(screen.queryAllByTestId('place-item-skeleton')).toHaveLength(0);
  });

  test('renders "No places found" when places array is empty and not loading/error', () => {
    mockedUsePlacesContext.mockReturnValue({
      places: [], // Simula array vacío
      loading: false,
      error: '',
      removePlace: jest.fn(),
      refetchPlaces: jest.fn(),
      updatePlace: jest.fn(),
      addPlace: jest.fn(),
    });

    render(<PlacesList />);

    expect(screen.getByText('No places found')).toBeInTheDocument();
    expect(screen.queryAllByTestId('place-item-skeleton')).toHaveLength(0);
  });

  test('renders list of places when data is available', () => {
    // Este test usará el mock por defecto de beforeEach (places: mockPlaces, loading: false, error: null)
    render(<PlacesList />);

    expect(screen.getByText('Lugar 1')).toBeInTheDocument();
    expect(screen.getByText('Lugar 2')).toBeInTheDocument();
    expect(screen.getAllByTestId(/place-item-/)).toHaveLength(mockPlaces.length);
  });
});