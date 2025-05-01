import { useState, useEffect } from 'react';
import './SearchBar.scss';
import { Place } from '../../features/places/types/PlaceType';
import { Link } from 'react-router-dom';

const SearchBar = (  { places }: { places: Place[] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Place[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    

    useEffect(() => {
        if (searchTerm.trim().length > 2) {
            const filteredResults = places.filter((result) =>
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
