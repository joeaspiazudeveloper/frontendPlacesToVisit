import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals'; 
import { Place } from '../../types/PlaceType';
import PlacesList from './PlacesList';
import axios from 'axios'; // Import axios to mock it
import { toast } from 'react-toastify';

// Mock react-router-dom's useNavigate
const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => mockUseNavigate,
}));

// Mock PlacesContext
const mockPlacesContextValue = {
  places: [] as Place[],
  loading: false,
  error: null as string | null, // Explicitly allow null for no error state
  removePlace: jest.fn(),
  refetchPlaces: jest.fn(),
};

jest.mock('../../contexts/PlacesContext', () => ({
  usePlacesContext: () => mockPlacesContextValue,
}));

// Mock Vite's import.meta.env
Object.defineProperty(global, 'import', {
  configurable: true,
  value: {
    meta: {
      env: {
        VITE_API_URL: "http://mock-api.com/places",
      },
    },
  },
});

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock axios for HTTP requests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock child components
jest.mock('../../components/PlaceItem/PlaceItem', () => ({
  __esModule: true,
  // We need to pass through props here, especially onDelete, to allow testing its functionality
  default: jest.fn(({ place, onDelete }: { place: Place; onDelete: (id: string) => void }) => (
    <div data-testid="mock-place-item" onClick={() => onDelete(place._id || '')}>
      {place.title}
    </div>
  )),
}));

jest.mock('../../components/PlaceItemSkeleton', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="mock-place-item-skeleton" />),
}));

jest.mock('../../../../components/SearchBar/SearchBar', () => ({
  __esModule: true,
  default: jest.fn((props: any) => <div data-testid="mock-search-bar" {...props} />),
}));

// Mock window.confirm for deletion prompt
const mockWindowConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockWindowConfirm,
});


// --- TEST SUITE START ---
describe('PlacesList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlacesContextValue.places = [];
    mockPlacesContextValue.loading = false;
    mockPlacesContextValue.error = null; // Ensure it's null for no error
  });

  test('renders "No places found" when no places are available', () => {
    render(<PlacesList />);
    expect(screen.getByText(/no places found/i)).toBeInTheDocument();
  });

  test('renders the "Agregar Lugar Turistico" button', () => {
    render(<PlacesList />);
    expect(screen.getByRole('button', { name: /agregar lugar turistico/i })).toBeInTheDocument();
  });

  test('renders loading skeletons when loading is true', () => {
    mockPlacesContextValue.loading = true; 
    render(<PlacesList />);
    expect(screen.getAllByTestId('mock-place-item-skeleton')).toHaveLength(3);
  });

  test('renders error message when error is present', () => {
    const errorMessage = 'An error occurred fetching places';
    mockPlacesContextValue.error = errorMessage;
    render(<PlacesList />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  // Test: Renders PlaceItem components when places data is available
  test('renders PlaceItem components when places data is available', () => {
    const mockPlaces: Place[] = [
      {  _id: '1', title: 'Mock Place 1', description: 'Desc 1', mapsUrl: 'mapsUrl1', imageUrl: 'imageUrl1', city: 'City 1' },
      {  _id: '2', title: 'Mock Place 2', description: 'Desc 2', mapsUrl: 'mapsUrl2', imageUrl: 'imageUrl2', city: 'City 2' },  
    ]
    mockPlacesContextValue.places = mockPlaces;
    render(<PlacesList />);
    const placeItems = screen.getAllByTestId('mock-place-item');
    expect(placeItems).toHaveLength(2);
    expect(screen.getByText('Mock Place 1')).toBeInTheDocument();
    expect(screen.getByText('Mock Place 2')).toBeInTheDocument();
    expect(screen.queryByText(/no places found/i)).not.toBeInTheDocument();
  });

  // Test: Navigates to /addplace when the "Agregar Lugar Turistico" button is clicked
  test('navigates to /addplace when "Agregar Lugar Turistico" button is clicked', () => {
    render(<PlacesList />);
    const addButton = screen.getByRole('button', { name: /agregar lugar turistico/i });
    fireEvent.click(addButton);
    expect(mockUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockUseNavigate).toHaveBeenCalledWith('/addplace');
  });

  // Test: Deletion flow - user confirms, deletion succeeds
  test('deletes a place, updates context, shows success toast, and navigates on success', async () => {
    const placeToDelete = { _id: '1', title: 'Delete Me', description: '', mapsUrl: '', imageUrl: '', city: '' };
    mockPlacesContextValue.places = [placeToDelete];
    mockWindowConfirm.mockReturnValueOnce(true); // User confirms deletion
    mockedAxios.delete.mockResolvedValueOnce({}); // Axios delete call succeeds

    render(<PlacesList />);
    const placeItem = screen.getByTestId('mock-place-item');

    // Simulate clicking the place item (which triggers onDelete in our mock)
    fireEvent.click(placeItem);

    // Wait for async operations to complete
    await waitFor(() => {
      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockWindowConfirm).toHaveBeenCalledWith("Estas seguro que deseas eliminar este lugar turistico?");
      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith('http://mock-api.com/places/1');
      expect(mockPlacesContextValue.removePlace).toHaveBeenCalledTimes(1);
      expect(mockPlacesContextValue.removePlace).toHaveBeenCalledWith('1');
      expect(mockPlacesContextValue.refetchPlaces).toHaveBeenCalledTimes(1);
      expect(toast.warn).toHaveBeenCalledTimes(1);
      expect(toast.warn).toHaveBeenCalledWith('Lugar turistico eliminado.');
      expect(mockUseNavigate).toHaveBeenCalledTimes(1); // Already called by add place test if not clearAllMocks
      expect(mockUseNavigate).toHaveBeenCalledWith('/');
    });
  });

  // Test: Deletion flow - user cancels
  test('does not delete a place if user cancels confirmation', async () => {
    const placeToDelete = { _id: '1', title: 'Do Not Delete', description: '', mapsUrl: '', imageUrl: '', city: '' };
    mockPlacesContextValue.places = [placeToDelete];
    mockWindowConfirm.mockReturnValueOnce(false); // User cancels deletion

    render(<PlacesList />);
    const placeItem = screen.getByTestId('mock-place-item');
    fireEvent.click(placeItem);

    await waitFor(() => { // Use waitFor for async confirm/cancel as it might take a microtask turn
      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).not.toHaveBeenCalled(); // axios.delete should NOT be called
      expect(mockPlacesContextValue.removePlace).not.toHaveBeenCalled();
      expect(mockPlacesContextValue.refetchPlaces).not.toHaveBeenCalled();
      expect(toast.warn).not.toHaveBeenCalled();
      expect(mockUseNavigate).not.toHaveBeenCalledWith('/'); // Ensure navigation to '/' did not happen
    });
  });

  // Test: Deletion flow - deletion fails
  test('displays error toast when deletion fails', async () => {
    const placeToDelete = { _id: '1', title: 'Failed Delete', description: '', mapsUrl: '', imageUrl: '', city: '' };
    mockPlacesContextValue.places = [placeToDelete];
    mockWindowConfirm.mockReturnValueOnce(true); // User confirms
    mockedAxios.delete.mockRejectedValueOnce(new Error('Network Error')); // Axios delete call fails

    render(<PlacesList />);
    const placeItem = screen.getByTestId('mock-place-item');
    fireEvent.click(placeItem);

    await waitFor(() => {
      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockPlacesContextValue.removePlace).not.toHaveBeenCalled(); // removePlace should not be called on error
      expect(mockPlacesContextValue.refetchPlaces).not.toHaveBeenCalled(); // refetchPlaces should not be called on error
      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith('Error al eliminar el lugar turistico.');
      // Also ensure navigation to '/' does NOT happen on error
      expect(mockUseNavigate).not.toHaveBeenCalledWith('/');
    });
  });

  // Test: SearchBar Renders
  test('renders the SearchBar component', () => {
    render(<PlacesList />);
    expect(screen.getByTestId('mock-search-bar')).toBeInTheDocument();
  });

});