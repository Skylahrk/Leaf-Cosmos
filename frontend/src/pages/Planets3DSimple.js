import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Planets3DSimple = () => {
  const [selectedPlanet, setSelectedPlanet] = useState('all');
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const planets = [
    { name: 'Mercury', size: 30, color: '#8C7853', distance: 80, speed: 0.04 },
    { name: 'Venus', size: 45, color: '#FFC649', distance: 120, speed: 0.03 },
    { name: 'Earth', size: 48, color: '#4A90E2', distance: 160, speed: 0.02 },
    { name: 'Mars', size: 35, color: '#E27B58', distance: 200, speed: 0.018 },
    { name: 'Jupiter', size: 90, color: '#C88B3A', distance: 280, speed: 0.01 },
    { name: 'Saturn', size: 80, color: '#FAD5A5', distance: 360, speed: 0.009 },
    { name: 'Uranus', size: 60, color: '#4FD0E7', distance: 430, speed: 0.006 },
    { name: 'Neptune', size: 58, color: '#4166F5', distance: 490, speed: 0.005 }
  ];

  const filteredPlanets = selectedPlanet === 'all'
    ? planets
    : planets.filter(p => p.name.toLowerCase() === selectedPlanet);

  const getPlanetPosition = (distance, speed) => {
    const angle = (rotation * speed * Math.PI) / 180;
    const x = 400 + Math.cos(angle) * distance;
    const y = 350 + Math.sin(angle) * distance * 0.3;
    return { x, y, scale: 1 - Math.sin(angle) * 0.3 };
  };

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

        <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1rem', height: '700px', position: 'relative', overflow: 'hidden' }} data-testid="3d-canvas-container">
          {/* Starfield background */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 40%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)' }}>
            {[...Array(200)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '2px',
                  height: '2px',
                  background: 'white',
                  borderRadius: '50%',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.8 + 0.2,
                  animation: `twinkle ${Math.random() * 3 + 2}s infinite`
                }}
              />
            ))}
          </div>

          {/* Sun */}
          <div
            style={{
              position: 'absolute',
              left: '400px',
              top: '350px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #FFE484, #FDB813)',
              boxShadow: '0 0 60px rgba(255, 219, 88, 0.8), 0 0 100px rgba(255, 219, 88, 0.4)',
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          />

          {/* Planets */}
          {filteredPlanets.map(planet => {
            const pos = getPlanetPosition(planet.distance, planet.speed);
            return (
              <div key={planet.name}>
                {/* Orbit path */}
                <div
                  style={{
                    position: 'absolute',
                    left: '400px',
                    top: '350px',
                    width: planet.distance * 2 + 'px',
                    height: planet.distance * 0.6 + 'px',
                    border: '1px solid rgba(120, 140, 255, 0.15)',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none'
                  }}
                />
                
                {/* Planet */}
                <div
                  style={{
                    position: 'absolute',
                    left: pos.x + 'px',
                    top: pos.y + 'px',
                    width: planet.size * pos.scale + 'px',
                    height: planet.size * pos.scale + 'px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 30% 30%, ${planet.color}dd, ${planet.color})`,
                    boxShadow: `0 0 ${20 * pos.scale}px ${planet.color}88`,
                    transform: 'translate(-50%, -50%)',
                    transition: 'all 0.1s linear',
                    zIndex: Math.floor(pos.scale * 100),
                    cursor: 'pointer'
                  }}
                  title={planet.name}
                  data-testid={`planet-${planet.name.toLowerCase()}`}
                >
                  {/* Planet label */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-25px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    {planet.name}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>

        <Card style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '2rem' }} data-testid="3d-controls-info">
          <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>Interactive Features</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', color: '#b8c5ff' }}>
            <div>
              <strong style={{ color: '#fff' }}>Real-time Orbits:</strong> Planets orbit at different speeds
            </div>
            <div>
              <strong style={{ color: '#fff' }}>3D Perspective:</strong> Depth simulation with scaling
            </div>
            <div>
              <strong style={{ color: '#fff' }}>Planet Filter:</strong> Select individual planets to view
            </div>
            <div>
              <strong style={{ color: '#fff' }}>Hover Info:</strong> Hover over planets for names
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

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Planets3DSimple;
