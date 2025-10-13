import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Planets3D = () => {
  const [selectedPlanet, setSelectedPlanet] = useState('all');

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" data-testid="back-button">
              <Button variant="outline" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.3)', color: '#e0e6ff' }}>
                <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back
              </Button>
            </Link>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fff', fontFamily: 'Orbitron' }} data-testid="3d-view-title">3D Solar System</h1>
          </div>

          <div style={{ width: '250px' }}>
            <Select value={selectedPlanet} onValueChange={setSelectedPlanet}>
              <SelectTrigger style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }} data-testid="planet-filter-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: '#1a1f3a', border: '1px solid rgba(120,140,255,0.3)' }}>
                <SelectItem value="all">All Planets</SelectItem>
                <SelectItem value="mercury">Mercury</SelectItem>
                <SelectItem value="venus">Venus</SelectItem>
                <SelectItem value="earth">Earth</SelectItem>
                <SelectItem value="mars">Mars</SelectItem>
                <SelectItem value="jupiter">Jupiter</SelectItem>
                <SelectItem value="saturn">Saturn</SelectItem>
                <SelectItem value="uranus">Uranus</SelectItem>
                <SelectItem value="neptune">Neptune</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1rem', height: '700px' }} data-testid="3d-canvas-container">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#fff', fontSize: '1.2rem' }}>
            3D View Coming Soon - Three.js Integration in Progress
          </div>
        </Card>

        <Card style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '2rem' }} data-testid="3d-controls-info">
          <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>Controls</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', color: '#b8c5ff' }}>
            <div>
              <strong style={{ color: '#fff' }}>Rotate:</strong> Click and drag
            </div>
            <div>
              <strong style={{ color: '#fff' }}>Zoom:</strong> Scroll wheel
            </div>
            <div>
              <strong style={{ color: '#fff' }}>Pan:</strong> Right-click and drag
            </div>
            <div>
              <strong style={{ color: '#fff' }}>Info:</strong> Hover over planets
            </div>
          </div>
        </Card>

        <Card style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '2rem' }} data-testid="planet-facts">
          <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem' }}>Planet Facts</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'Mercury', fact: 'Smallest planet, closest to the Sun. One year = 88 Earth days.' },
              { name: 'Venus', fact: 'Hottest planet despite not being closest to the Sun. Dense atmosphere.' },
              { name: 'Earth', fact: 'Our home planet. Only known planet with life.' },
              { name: 'Mars', fact: 'The Red Planet. Has the largest volcano in the solar system.' },
              { name: 'Jupiter', fact: 'Largest planet. Great Red Spot is a giant storm.' },
              { name: 'Saturn', fact: 'Famous for its spectacular ring system.' },
              { name: 'Uranus', fact: 'Rotates on its side. Coldest planetary atmosphere.' },
              { name: 'Neptune', fact: 'Windiest planet with supersonic winds.' }
            ].map(planet => (
              <div key={planet.name} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }} data-testid={`planet-fact-${planet.name.toLowerCase()}`}>
                <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{planet.name}</h4>
                <p style={{ color: '#b8c5ff', lineHeight: '1.5' }}>{planet.fact}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Planets3D;
