import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DishDetailPage from './pages/DishDetailPage';
import AddDishPage from './pages/AddDishPage';
import EditDishPage from './pages/EditDishPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dish/:id" element={<DishDetailPage />} />
        <Route path="/add" element={<AddDishPage />} />
        <Route path="/edit/:id" element={<EditDishPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
