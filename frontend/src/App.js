import React, { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SkyMap from './pages/SkyMap';
import AdvancedSkyMap from './pages/AdvancedSkyMap';
import Planner from './pages/Planner';
import CustomConstellations from './pages/CustomConstellations';
import Constellations3D from './pages/Constellations3D';
import Planets3DSimple from './pages/Planets3DSimple';
import EnhancedSolarSystem from './pages/EnhancedSolarSystem';
import ViewerAnalytics from './components/ViewerAnalytics';
import Footer from './components/Footer';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ViewerAnalytics />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sky-map" element={<SkyMap />} />
          <Route path="/advanced-sky" element={<AdvancedSkyMap />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/constellations" element={<CustomConstellations />} />
          <Route path="/constellations-3d" element={<Constellations3D />} />
          <Route path="/3d-view" element={<Planets3DSimple />} />
          <Route path="/solar-system" element={<EnhancedSolarSystem />} />
        </Routes>
        <Footer />
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
