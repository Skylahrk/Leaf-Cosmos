import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Planet component
function Planet({ position, size, color, name, speed, distance }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      meshRef.current.position.x = Math.cos(time * speed) * distance;
      meshRef.current.position.z = Math.sin(time * speed) * distance;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
}

// Sun component
function Sun() {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshStandardMaterial color="#FDB813" emissive="#FDB813" emissiveIntensity={1.5} />
      <pointLight position={[0, 0, 0]} intensity={2} distance={100} />
    </mesh>
  );
}

// Solar System Scene
function SolarSystemScene({ selectedPlanet }) {
  const planets = [
    { name: 'Mercury', size: 0.4, color: '#8C7853', speed: 0.04, distance: 6 },
    { name: 'Venus', size: 0.95, color: '#FFC649', speed: 0.03, distance: 9 },
    { name: 'Earth', size: 1, color: '#4A90E2', speed: 0.02, distance: 12 },
    { name: 'Mars', size: 0.5, color: '#E27B58', speed: 0.018, distance: 15 },
    { name: 'Jupiter', size: 2.2, color: '#C88B3A', speed: 0.01, distance: 22 },
    { name: 'Saturn', size: 1.9, color: '#FAD5A5', speed: 0.009, distance: 28 },
    { name: 'Uranus', size: 1.4, color: '#4FD0E7', speed: 0.006, distance: 34 },
    { name: 'Neptune', size: 1.3, color: '#4166F5', speed: 0.005, distance: 40 }
  ];

  const filteredPlanets = selectedPlanet === 'all'
    ? planets
    : planets.filter(p => p.name.toLowerCase() === selectedPlanet);

  return (
    <>
      <ambientLight intensity={0.3} />
      <Sun />
      <Stars radius={150} depth={60} count={8000} factor={5} saturation={0} fade speed={1} />
      
      {filteredPlanets.map(planet => (
        <Planet
          key={planet.name}
          name={planet.name}
          position={[planet.distance, 0, 0]}
          size={planet.size}
          color={planet.color}
          speed={planet.speed}
          distance={planet.distance}
        />
      ))}
      
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={80}
      />
    </>
  );
}

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
          <Canvas camera={{ position: [0, 25, 50], fov: 60 }}>
            <SolarSystemScene selectedPlanet={selectedPlanet} />
          </Canvas>
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
