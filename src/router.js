import  {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import "./index.css";
import App from './App';
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([]);


return (
    <div>
      <StrictMode>
        <App />
      </StrictMode>
    </div>
)