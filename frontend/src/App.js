import React, { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SkyMap from './pages/SkyMap';
import Planner from './pages/Planner';
import CustomConstellations from './pages/CustomConstellations';
import Planets3DSimple from './pages/Planets3DSimple';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sky-map" element={<SkyMap />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/constellations" element={<CustomConstellations />} />
          <Route path="/3d-view" element={<Planets3D />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
