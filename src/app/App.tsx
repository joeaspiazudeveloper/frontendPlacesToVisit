import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../components/header/Header';
import routes from '../routing/routes';
import { PlacesProvider } from '../features/places/contexts/PlacesContext';
import { ToastContainer } from 'react-toastify';
import { FeatureFlagProvider } from '@shared/contexts/FeatureFlagContext';


function App() {

  return (
    <div className='app'>
      <BrowserRouter>
        <Header />
        <FeatureFlagProvider>
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
        </FeatureFlagProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
