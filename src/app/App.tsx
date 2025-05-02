import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../components/header/Header';
import routes from '../routing/routes';
import { PlacesProvider } from '../features/places/contexts/PlacesContext';
import { ToastContainer } from 'react-toastify';


function App() {

  return (
    <div className='app'>
      <BrowserRouter>
        <Header />
        <PlacesProvider>
          <Routes>
            { routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
          <ToastContainer />
        </PlacesProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
