import React from 'react'
import './Header.css';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <div className="header">
        <h2>List of Touristic Places in Ecuador</h2>
        <div className="header-addplace">
            <button>
                <Link to="/addplace">Add Place</Link>
            </button>
        </div>
    </div>
  )
}
