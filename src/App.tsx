import './App.scss';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';

import { PlacesList, PlaceDetail, AddPlace } from './features/places';


function App() {

  return (
    <div className='app'>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<PlacesList />} />
          <Route path="/places" element={<PlacesList />} />
          <Route path="/places/:placeId" element={<PlaceDetail />} />
          <Route path="/addplace" element={<AddPlace />} />
          <Route path="/addplace/:id" element={<AddPlace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
