import { useState, useEffect } from 'react';
import './SearchBar.scss';
import { Place } from '../../../places/types/PlaceType';
import { Link } from 'react-router-dom';

const mockSearchResults: Place[] = [
    { _id: '67f53a0f1dd2a70673bbb76e', title: 'Ruinas de Ingapirca', description: 'Cuenca', mapsUrl: 'https://www.google.com', imageUrl: 'https://www.google.com', city: 'Cuenca' },
    { _id: '67f53aca1dd2a70673bbb779', title: 'Mitad del Mundo', description: 'Quito', mapsUrl: 'https://www.google.com', imageUrl: 'https://www.google.com', city: 'Quito' },
    { _id: '67fed974e5ab435508038682', title: 'Malecon 2000', description: 'Guayaquil', mapsUrl: 'https://www.google.com', imageUrl: 'https://www.google.com', city: 'Guayaquil' },
    { _id: '4', title: 'Playa el Murcielago', description: 'Manta', mapsUrl: 'https://www.google.com', imageUrl: 'https://www.google.com', city: 'Manta' },
    { _id: '5', title: 'Catedral de Ambato', description: 'Ambato', mapsUrl: 'https://www.google.com', imageUrl: 'https://www.google.com', city: 'Ambato' },
];

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Place[]>([]);
    const [isOpen, setIsOpen] = useState(false);


    useEffect(() => {
        if (searchTerm.trim().length > 2) {
            const filteredResults = mockSearchResults.filter((result) =>
                result.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(filteredResults);
            setIsOpen(true);
        } else {
            setSearchResults([]);
            setIsOpen(false);
        }
    }, [searchTerm]);

    const handleClearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setIsOpen(false);
    };

    const handleResultClick = (result: Place) => {
        setSearchTerm(result.title);
        setSearchResults([]);
        setIsOpen(false);
    };

    return (
        <div className="search-bar">
            <div className="search-bar__input-wrapper">
                <input
                    type="text"
                    placeholder="Buscar destinos turisticos en Ecuador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar__input"
                />
                {searchTerm && (
                    <button
                        onClick={handleClearSearch}
                        className="search-bar__clear-button"
                        title="Limpiar búsqueda"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                )}
            </div>

            {/* Search results */}
            {isOpen && (
                <div className="search-results">
                    {searchResults.length === 0 && searchTerm.trim().length > 2 && (
                        <div className="search-results__message">No se encontraron resultados.</div>
                    )}
                    {searchResults.length > 0 && (
                        <ul className="search-results__list">
                            {searchResults.map((result) => (
                                <li
                                    key={result._id}
                                    onClick={() => handleResultClick(result)}
                                    className="search-results__item"
                                >
                                    <Link to={`/places/${result._id}`}>
                                        <div className="search-results__item-title">
                                            {result.title}
                                        </div>
                                    </Link>
                                    
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
