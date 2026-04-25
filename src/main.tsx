import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import App from './App';
import './index.css';



// 🔐 Token de développement garanti (valide jusqu’en juin 2026)
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZXYtdXNlci0wMDEiLCJlbWFpbCI6InRlc3RAZXRhZmFrbmEuY29tIiwiaWF0IjoxNzc3MTI1NTkyLCJleHAiOjE3Nzc3MzAzOTJ9.NqFP7fILfTt3F31GIfcOtEoZVmolvxZdKESiJg5PMdg';

if (!localStorage.getItem('access_token')) {
  localStorage.setItem('access_token', DEV_TOKEN);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);