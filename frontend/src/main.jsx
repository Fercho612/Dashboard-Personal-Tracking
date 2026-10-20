import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Los estilos globales van primero: así los CSS de cada sección, que se cargan después,
// pueden sobrescribirlos con la misma especificidad.
import './styles/global.css'
import App from './App.jsx'

// StrictMode ejecuta algunos efectos dos veces en desarrollo para detectar bugs.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
