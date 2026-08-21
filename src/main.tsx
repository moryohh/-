import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preloadAppImages } from './utils/imagePreloader';

// Preload all critical map assets, biomes, and images in the background immediately
preloadAppImages();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
