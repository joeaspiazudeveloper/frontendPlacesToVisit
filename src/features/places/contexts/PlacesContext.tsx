import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Place } from "../types/PlaceType";
import FetchPlaces from "../hooks/FetchPlaces";

interface PlacesContextType {
    places: Place[];
    loading: boolean;
    error: string;
    addPlace: (place: Place) => void;
    updatePlace: (place: Place) => void;
    removePlace: (placeId: string) => void;
    refetchPlaces: () => void;
}

const PlacesContext = createContext<PlacesContextType>({
    places: [],
    loading: false,
    error: '',
    addPlace: () => { },
    updatePlace: () => { },
    removePlace: () => { },
    refetchPlaces: () => { }
});

export const PlacesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const apiUrl = import.meta.env.VITE_API_URL + '/places';
    const { places: fetchedPlaces, loading, error, fetchPlacesData, setPlaces: setFetchedPlaces } = FetchPlaces(apiUrl);
    const [places, setPlaces] = useState<Place[]>(fetchedPlaces);

    useEffect(() => {
        setPlaces(fetchedPlaces); // Sincroniza el estado local con los datos fetched
    }, [fetchedPlaces]);

    const addPlace = (newPlace: Place) => {
        setPlaces((prevPlaces) => [...prevPlaces, newPlace]);
    };

    const updatePlace = (updatedPlace: Place) => {
        setPlaces((prevPlaces) =>
            prevPlaces.map((place) => (place._id === updatedPlace._id ? updatedPlace : place))
        );
    };

    const removePlace = (placeId: string) => {
        setPlaces((prevPlaces) => prevPlaces.filter((place) => place._id !== placeId));
    }

    const refetchPlaces = () => {
        fetchPlacesData();
    };

    const value: PlacesContextType = {
        places,
        loading,
        error,
        addPlace,
        updatePlace,
        removePlace,
        refetchPlaces,
    };

    return (
        <PlacesContext.Provider value={value}>
            {children}
        </PlacesContext.Provider>
    );
}

export const usePlacesContext = () => {
    const context = useContext(PlacesContext);
    if (!context) {
        throw new Error('usePlacesContext must be used within a PlacesProvider');
    }
    return context;
}