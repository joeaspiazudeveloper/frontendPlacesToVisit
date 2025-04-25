import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../components/header/Header';
import routes from '../routing/routes';


function App() {

  return (
    <div className='app'>
      <BrowserRouter>
        <Header />
        <Routes>
          { routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
