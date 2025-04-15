import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Place } from '../types/PlaceType';
import axios from 'axios';
import PlaceItem from '../components/PlaceItem';

function PlaceDetail() {
    const { placeId } = useParams<{ placeId: string }>();
    const [place, setPlace] = useState<Place | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const response = await axios.get(`${apiUrl}/${placeId}`);
                setPlace(response.data);
            } catch (error) {
                setError("Failed to load place details.");
            } finally {
                setLoading(false);
            }
        }
        fetchPlace();
    }, [placeId]);


    return (
        <div className="place-detail">
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : !place ? (
                <p>Place not found</p>
            ) : (
                <div className="place-detail-maincontent">
                    <div className="back-button">
                        <Link to="/">
                            <button>Back</button>
                        </Link>
                    </div>
                     <PlaceItem place={place} key={place._id} onDelete={() => {}} isDetail={false} />
                </div>
               

            )}
        </div>
    )
}

export default PlaceDetail