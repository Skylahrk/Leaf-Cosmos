import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Planet component
function Planet({ position, size, color, name, speed, distance }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      meshRef.current.position.x = Math.cos(time * speed) * distance;
      meshRef.current.position.z = Math.sin(time * speed) * distance;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </mesh>
      {hovered && (
        <Text
          position={[position[0], position[1] + size + 1, position[2]]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      )}
    </group>
  );
}

// Sun component
function Sun() {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial
        color="#FDB813"
        emissive="#FDB813"
        emissiveIntensity={1}
      />
    </mesh>
  );
}

// Solar System component
function SolarSystem({ selectedPlanet }) {
  const planets = [
    { name: 'Mercury', size: 0.4, color: '#8C7853', speed: 0.04, distance: 5 },
    { name: 'Venus', size: 0.9, color: '#FFC649', speed: 0.03, distance: 7 },
    { name: 'Earth', size: 1, color: '#4A90E2', speed: 0.02, distance: 10 },
    { name: 'Mars', size: 0.5, color: '#E27B58', speed: 0.018, distance: 13 },
    { name: 'Jupiter', size: 2, color: '#C88B3A', speed: 0.001, distance: 18 },
    { name: 'Saturn', size: 1.8, color: '#FAD5A5', speed: 0.0009, distance: 24 },
    { name: 'Uranus', size: 1.2, color: '#4FD0E7', speed: 0.0006, distance: 30 },
    { name: 'Neptune', size: 1.1, color: '#4166F5', speed: 0.0005, distance: 35 }
  ];

  const filteredPlanets = selectedPlanet === 'all'
    ? planets
    : planets.filter(p => p.name.toLowerCase() === selectedPlanet);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={2} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Sun />
      
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
        zoomSpeed={0.6}
        panSpeed={0.5}
        rotateSpeed={0.4}
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
          <Canvas camera={{ position: [0, 20, 40], fov: 60 }} data-testid="3d-canvas">
            <SolarSystem selectedPlanet={selectedPlanet} />
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
