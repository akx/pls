import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';

const root = document.createElement('main');
document.body.appendChild(root);
const reactRoot = createRoot(root);
reactRoot.render(<App />);
