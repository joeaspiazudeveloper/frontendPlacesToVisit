import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PlacesList from './pages/PlacesList';
import AddPlace from './pages/AddPlace';
import Header from './components/header/Header';

function App() {

  return (
    <div className='app'>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<PlacesList />} />
          <Route path="/addplace" element={<AddPlace />} />
          <Route path="/addplace/:id" element={<AddPlace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
