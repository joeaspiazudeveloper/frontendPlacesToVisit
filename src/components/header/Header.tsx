import './Header.scss';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <div className="header">
        <h2>
          <Link to="/">Ecuador Travel</Link>
        </h2>
        <div className="header-addplace">
            <button>
                <Link to="/addplace">Add Place</Link>
            </button>
        </div>
    </div>
  )
}
