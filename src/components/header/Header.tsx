import './Header.scss';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <div className="header">
        <h2><Link to="/">Ecuador Travel</Link></h2>
        <h2 className='second-header'>Ven y descubre Ecuador! 🇪🇨</h2>
    </div>
  )
}
