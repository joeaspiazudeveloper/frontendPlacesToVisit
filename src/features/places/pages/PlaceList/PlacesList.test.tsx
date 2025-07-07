import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals'; 
import { Place } from '../../types/PlaceType';
import PlacesList from './PlacesList'; // Your component under test
import axios from 'axios';
import { toast } from 'react-toastify';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// --- Mocks ---

// Mock react-router-dom's useNavigate and useParams
const mockUseNavigate = jest.fn();
const mockUseParams = jest.fn();

jest.mock('react-router-dom', () => {
  // Explicitly cast jest.requireActual to object to resolve TypeScript error (Spread types may only be created from object types)
  const actual = jest.requireActual('react-router-dom') as object; 
  return {
    __esModule: true,
    ...actual, 
    useNavigate: () => mockUseNavigate,
    useParams: () => mockUseParams(),
  };
});

// Mock PlacesContext
const mockPlacesContextValue = {
  places: [] as Place[],
  loading: false,
  error: null as string | null,
  removePlace: jest.fn(),
  refetchPlaces: jest.fn(),
};

jest.mock('../../contexts/PlacesContext', () => ({
  usePlacesContext: () => mockPlacesContextValue,
}));

// Set process.env directly for VITE_API_URL, as babel-plugin-transform-vite-meta-env translates import.meta.env to process.env
process.env.VITE_API_URL = "http://mock-api.com"; 

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

// Mock child components to isolate PlacesList's logic
// PlaceItem mock: Refined to accurately represent its behavior in PlacesList.tsx
jest.mock('../../components/PlaceItem/PlaceItem', () => ({
  __esModule: true,
  default: jest.fn(({ place, onDelete, isDetail }: { place: Place; onDelete: (id: string) => void; isDetail: boolean }) => (
    <div data-testid={`mock-place-item-${place._id}`}>
      {/* Simulate the Link click for detail view */}
      <a href={`/places/${place._id}`} data-testid={`link-to-detail-${place._id}`}>
        {place.title} Link
      </a>
      {/* Separate button for delete action, rendered if isDetail prop is true (as in PlacesList.tsx) */}
      {isDetail && ( 
        <button data-testid={`delete-btn-${place._id}`} onClick={() => onDelete(place._id || '')}>
          Delete {place.title}
        </button>
      )}
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

// Mock EtDialog - crucial for testing dialog visibility and content
jest.mock('../../../../shared/components/EtDialog/EtDialog', () => ({
  __esModule: true,
  default: jest.fn(({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null; // If dialog is not open, it renders nothing
    return (
      <div data-testid="mock-et-dialog" aria-modal="true" role="dialog">
        <h2 data-testid="dialog-title">{title}</h2>
        <button onClick={onClose} data-testid="dialog-close-button">Close</button>
        <div data-testid="dialog-content">{children}</div>
      </div>
    );
  }),
}));

// Mock PlaceDetail - to verify it receives correct props and renders its content
jest.mock('../../pages/PlaceDetail/PlaceDetail', () => ({
  __esModule: true,
  default: jest.fn(({ place }: { place: Place }) => (
    <div data-testid="mock-place-detail">
      <h3>Detail for {place.title}</h3>
      <p>{place.description}</p>
    </div>
  )),
}));

// Mock window.confirm for deletion prompt
const mockWindowConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockWindowConfirm,
});

// Spy on console.error to prevent Jest from failing tests on expected console errors
let consoleErrorSpy: jest.SpyInstance;

// Helper function to render PlacesList within a Router context
const renderWithRouter = (ui: React.ReactElement, { initialEntries = ['/places'] } = {}) => {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path="/places" element={ui} />
                <Route path="/places/:id" element={ui} /> 
                <Route path="/" element={ui} /> 
                <Route path="/addplace" element={<div>Add Place Page Content</div>} /> 
            </Routes>
        </MemoryRouter>
    );
};


// --- TEST SUITE START ---
describe('PlacesList', () => {
  beforeEach(() => {
    // Clear all mocks and reset their states before each test
    jest.clearAllMocks(); 

    // Reset PlacesContext mock values
    mockPlacesContextValue.places = [];
    mockPlacesContextValue.loading = false;
    mockPlacesContextValue.error = null;
    mockPlacesContextValue.removePlace.mockClear(); 
    mockPlacesContextValue.refetchPlaces.mockClear();

    // Reset React Router mocks
    mockUseParams.mockReturnValue({}); // Default to no ID in URL
    mockUseNavigate.mockClear(); 

    // Reset Axios mocks
    mockedAxios.get.mockClear();
    mockedAxios.delete.mockClear();
    // Provide a default mock for axios.get for cases not specifically overridden
    mockedAxios.get.mockImplementation((url) => {
      // This implementation will handle general detail fetches for known IDs
      if (url.startsWith(`${process.env.VITE_API_URL}/`)) {
        const id = url.split('/').pop();
        if (['1', 'place1', 'place2', 'detailed-place-id', 'loading-place-id', 'close-test-id'].includes(id || '')) {
          return Promise.resolve({ data: { _id: id, title: `Fetched ${id}`, description: `Desc for ${id}`, mapsUrl: 'maps', imageUrl: 'image', city: 'City' } });
        }
      }
      return Promise.reject(new Error('API call not mocked for this URL'));
    });
    mockedAxios.delete.mockResolvedValue({}); // Default successful delete

    // Reset other mocks
    mockWindowConfirm.mockClear();
    (toast.warn as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();

    // Suppress console.error output during tests to avoid noise or unintended failures
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original console.error after each test
    consoleErrorSpy.mockRestore();
  });


  // --- Rendering States Tests ---
  test('renders "No places found" when no places are available', () => {
    renderWithRouter(<PlacesList />);
    expect(screen.getByText(/no places found/i)).toBeInTheDocument();
  });

  test('renders the "Agregar Lugar Turistico" button', () => {
    renderWithRouter(<PlacesList />);
    expect(screen.getByRole('button', { name: /agregar lugar turistico/i })).toBeInTheDocument();
  });

  test('renders loading skeletons when PlacesContext loading is true', () => {
    mockPlacesContextValue.loading = true; 
    renderWithRouter(<PlacesList />);
    expect(screen.getAllByTestId('mock-place-item-skeleton')).toHaveLength(3);
  });

  test('renders error message when PlacesContext error is present', () => {
    const errorMessage = 'An error occurred fetching places';
    mockPlacesContextValue.error = errorMessage;
    renderWithRouter(<PlacesList />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('renders PlaceItem components when places data is available in context', () => {
    const mockPlaces: Place[] = [
      {  _id: 'place1', title: 'Mock Place 1', description: 'Desc 1', mapsUrl: 'mapsUrl1', imageUrl: 'imageUrl1', city: 'City 1' },
      {  _id: 'place2', title: 'Mock Place 2', description: 'Desc 2', mapsUrl: 'mapsUrl2', imageUrl: 'imageUrl2', city: 'City 2' },  
    ];
    mockPlacesContextValue.places = mockPlaces;
    renderWithRouter(<PlacesList />);
    const placeItems = screen.getAllByTestId(/mock-place-item-/i); 
    expect(placeItems).toHaveLength(2);
    // Assert against the text rendered by the PlaceItem mock's <a> tag
    expect(screen.getByText('Mock Place 1 Link')).toBeInTheDocument(); 
    expect(screen.getByText('Mock Place 2 Link')).toBeInTheDocument(); 
    expect(screen.queryByText(/no places found/i)).not.toBeInTheDocument();
  });

  // --- Add Place Button Test ---
  test('navigates to /addplace when "Agregar Lugar Turistico" button is clicked', async () => {
    renderWithRouter(<PlacesList />);
    const addButton = screen.getByRole('button', { name: /agregar lugar turistico/i });
    await userEvent.click(addButton); 
    expect(mockUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockUseNavigate).toHaveBeenCalledWith('/addplace');
  });

  // --- Place Detail Dialog Functionality Tests ---
  test('dialog is not open initially when no id in URL', () => {
    renderWithRouter(<PlacesList />, { initialEntries: ['/places'] });
    expect(screen.queryByTestId('mock-et-dialog')).not.toBeInTheDocument();
  });

  test('opens dialog and shows loading when id is present in URL', async () => {
    const testId = 'loading-place-id';
    mockUseParams.mockReturnValue({ id: testId }); 
    // Mock axios.get to return a pending promise to simulate loading state
    mockedAxios.get.mockImplementationOnce(() => new Promise(() => {}));

    renderWithRouter(<PlacesList />, { initialEntries: [`/places/${testId}`] });

    // Dialog should appear with loading content
    expect(screen.getByTestId('mock-et-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Cargando...');
    expect(screen.getByTestId('dialog-content')).toHaveTextContent('Cargando detalles...');
    
    // Ensure the main list (behind the dialog) is still visible
    expect(screen.getByRole('button', { name: /agregar lugar turistico/i })).toBeInTheDocument();
  });

  test('displays place details in dialog after successful fetch', async () => {
    const testId = 'detailed-place-id';
    const mockDetailPlace: Place = { 
        _id: testId, 
        title: 'Detailed Test Place', 
        description: 'This is a detailed description.', 
        mapsUrl: 'maps.com', 
        imageUrl: 'image.jpg', 
        city: 'Test City' 
    };
    mockUseParams.mockReturnValue({ id: testId });
    // Mock the specific axios get call for this ID to resolve with data
    mockedAxios.get.mockResolvedValueOnce({ data: mockDetailPlace });

    renderWithRouter(<PlacesList />, { initialEntries: [`/places/${testId}`] });

    await waitFor(() => {
      // Expect dialog to be open and display the fetched place details
      expect(screen.getByTestId('mock-et-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent(mockDetailPlace.title);
      expect(screen.getByTestId('mock-place-detail')).toBeInTheDocument(); // PlaceDetail component should be rendered
      expect(screen.getByText(`Detail for ${mockDetailPlace.title}`)).toBeInTheDocument();
      expect(screen.getByText(mockDetailPlace.description)).toBeInTheDocument();
    });

    // Loading indicator should be gone
    expect(screen.queryByText('Cargando detalles...')).not.toBeInTheDocument();
    // Ensure the main list is still visible
    expect(screen.getByRole('button', { name: /agregar lugar turistico/i })).toBeInTheDocument();
  });

  test('displays error in dialog if fetching details fails', async () => {
    const testId = 'error-place-id';
    mockUseParams.mockReturnValue({ id: testId });
    // Mock axios get call for this ID to reject (simulate network error, 500, etc.)
    mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithRouter(<PlacesList />, { initialEntries: [`/places/${testId}`] });

    await waitFor(() => {
      expect(screen.getByTestId('mock-et-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Detalle del Lugar'); // Default title when error occurs
      expect(screen.getByTestId('dialog-content')).toHaveTextContent('Error al cargar los detalles del lugar.');
      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith('Error al cargar los detalles del lugar.');
    });
    // PlaceDetail component should NOT be rendered on error
    expect(screen.queryByTestId('mock-place-detail')).not.toBeInTheDocument(); 
  });

  test('closes dialog and navigates back to /places when close button is clicked', async () => {
    const testId = 'close-test-id';
    mockUseParams.mockReturnValue({ id: testId });
    mockedAxios.get.mockResolvedValueOnce({ data: { _id: testId, title: 'Test Close', description: 'desc', mapsUrl: 'maps', imageUrl: 'image', city: 'City' } });

    renderWithRouter(<PlacesList />, { initialEntries: [`/places/${testId}`] });

    await waitFor(() => {
      expect(screen.getByTestId('mock-et-dialog')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('dialog-close-button'));
    
    await waitFor(() => {
        expect(screen.queryByTestId('mock-et-dialog')).not.toBeInTheDocument(); // Dialog should disappear
    });
    expect(mockUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockUseNavigate).toHaveBeenCalledWith('/places'); // Should navigate back to base places URL
  });


  // --- Delete Functionality Tests ---
  test('deletes a place from the list, updates context, shows success toast, and navigates on success', async () => {
    const placeToDelete = { _id: '1', title: 'Delete Me', description: '', mapsUrl: '', imageUrl: '', city: '' };
    mockPlacesContextValue.places = [placeToDelete];
    mockWindowConfirm.mockReturnValueOnce(true); // User confirms deletion
    mockedAxios.delete.mockResolvedValueOnce({}); // Axios delete call succeeds

    renderWithRouter(<PlacesList />, { initialEntries: ['/places'] });
    
    const deleteButton = screen.getByTestId(`delete-btn-${placeToDelete._id}`);
    await userEvent.click(deleteButton); 

    await waitFor(() => {
      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockWindowConfirm).toHaveBeenCalledWith("Estas seguro que deseas eliminar este lugar turistico?");
      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(`${process.env.VITE_API_URL}/1`); 
      expect(mockPlacesContextValue.removePlace).toHaveBeenCalledTimes(1);
      expect(mockPlacesContextValue.removePlace).toHaveBeenCalledWith('1');
      expect(mockPlacesContextValue.refetchPlaces).toHaveBeenCalledTimes(1);
      expect(toast.warn).toHaveBeenCalledTimes(1);
      expect(toast.warn).toHaveBeenCalledWith('Lugar turistico eliminado.');
      // The component navigates to '/places' after any successful deletion
      expect(mockUseNavigate).toHaveBeenCalledTimes(1); 
      expect(mockUseNavigate).toHaveBeenCalledWith('/places'); 
    });
  });

  test('does not delete a place if user cancels confirmation', async () => {
    const placeToDelete = { _id: '1', title: 'Do Not Delete', description: '', mapsUrl: '', imageUrl: '', city: '' };
    mockPlacesContextValue.places = [placeToDelete];
    mockWindowConfirm.mockReturnValueOnce(false); // User cancels deletion

    renderWithRouter(<PlacesList />, { initialEntries: ['/places'] });
    const deleteButton = screen.getByTestId(`delete-btn-${placeToDelete._id}`);
    await userEvent.click(deleteButton);

    await waitFor(() => { // Use waitFor as window.confirm is synchronous but subsequent checks might not be immediate
      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).not.toHaveBeenCalled(); // axios.delete should NOT be called
      expect(mockPlacesContextValue.removePlace).not.toHaveBeenCalled();
      expect(mockPlacesContextValue.refetchPlaces).not.toHaveBeenCalled();
      expect(toast.warn).not.toHaveBeenCalled();
      expect(mockUseNavigate).not.toHaveBeenCalled(); // No navigation should occur
    });
  });

  test('displays error toast when deletion fails', async () => {
    const placeToDelete = { _id: '1', title: 'Failed Delete', description: '', mapsUrl: '', imageUrl: '', city: '' };
    mockPlacesContextValue.places = [placeToDelete];
    mockWindowConfirm.mockReturnValueOnce(true); // User confirms
    mockedAxios.delete.mockRejectedValueOnce(new Error('Network Error')); // Axios delete call fails

    renderWithRouter(<PlacesList />, { initialEntries: ['/places'] });
    const deleteButton = screen.getByTestId(`delete-btn-${placeToDelete._id}`);
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockPlacesContextValue.removePlace).not.toHaveBeenCalled(); // removePlace should not be called on error
      expect(mockPlacesContextValue.refetchPlaces).not.toHaveBeenCalled(); // refetchPlaces should not be called on error
      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith('Error al eliminar el lugar turistico.');
      expect(mockUseNavigate).not.toHaveBeenCalled(); // Navigation should not happen on error
    });
  });

  test('closes dialog and navigates to /places if detailed item is deleted', async () => {
    const detailedPlaceId = 'detailed-place-id';
    const placeToDeleteFromList = { _id: detailedPlaceId, title: 'Detailed Place to Delete', description: 'Desc', mapsUrl: 'maps', imageUrl: 'image', city: 'City' };
    
    // Simulate initial context with some places (including the one to be detailed)
    mockPlacesContextValue.places = [
      { _id: 'other-place', title: 'Other Place', description: '', mapsUrl: '', imageUrl: '', city: '' },
      placeToDeleteFromList
    ];

    // Mock useParams to simulate being on the detailed view URL
    mockUseParams.mockReturnValue({ id: detailedPlaceId });
    // Mock the axios call for fetching the detail, as PlacesList will try to fetch it
    mockedAxios.get.mockResolvedValueOnce({ data: placeToDeleteFromList });

    renderWithRouter(<PlacesList />, { initialEntries: [`/places/${detailedPlaceId}`] });

    // Wait for the dialog to open and detail to load
    await waitFor(() => {
      expect(screen.getByTestId('mock-et-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent(placeToDeleteFromList.title);
    });

    mockWindowConfirm.mockReturnValueOnce(true); // User confirms deletion
    mockedAxios.delete.mockResolvedValueOnce({}); // Mock successful deletion

    // Find the delete button within the list for the item that is currently detailed
    const deleteButton = screen.getByTestId(`delete-btn-${detailedPlaceId}`);
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(`${process.env.VITE_API_URL}/${detailedPlaceId}`);
      expect(mockPlacesContextValue.removePlace).toHaveBeenCalledTimes(1);
      expect(mockPlacesContextValue.removePlace).toHaveBeenCalledWith(detailedPlaceId);
      expect(toast.warn).toHaveBeenCalledTimes(1);
      expect(toast.warn).toHaveBeenCalledWith('Lugar turistico eliminado.');
      expect(mockUseNavigate).toHaveBeenCalledTimes(1); // Should navigate back to /places via handleCloseDetailDialog
      expect(mockUseNavigate).toHaveBeenCalledWith('/places'); 
      expect(screen.queryByTestId('mock-et-dialog')).not.toBeInTheDocument(); // Dialog should be closed
      expect(mockPlacesContextValue.refetchPlaces).toHaveBeenCalledTimes(1);
    });
  });

  // --- SearchBar Test ---
  test('renders the SearchBar component', () => {
    renderWithRouter(<PlacesList />);
    expect(screen.getByTestId('mock-search-bar')).toBeInTheDocument();
  });
});