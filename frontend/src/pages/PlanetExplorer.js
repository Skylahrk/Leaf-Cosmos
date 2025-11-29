import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ArrowLeft, RotateCw, ZoomIn, Info, Ruler, Thermometer, Users } from 'lucide-react';

const PlanetExplorer = () => {
  const mountRef = useRef(null);
  const [selectedPlanet, setSelectedPlanet] = useState('earth');
  const [showInfo, setShowInfo] = useState(true);
  const sceneRef = useRef(null);
  const planetMeshRef = useRef(null);

  const planetsData = {
    mercury: {
      name: 'Mercury',
      color: 0x8C7853,
      size: 2,
      texture: null,
      rotationSpeed: 0.002,
      info: {
        diameter: '4,879 km',
        distanceFromSun: '57.9 million km',
        orbitalPeriod: '88 Earth days',
        dayLength: '59 Earth days',
        temperature: '-173°C to 427°C',
        moons: '0',
        atmosphere: 'Almost none (trace amounts)',
        composition: 'Rocky, iron core',
        description: 'The smallest and innermost planet. Named after the Roman messenger god due to its swift orbit.',
        facts: [
          'Smallest planet in the Solar System',
          'Has the most eccentric orbit',
          'Surface has thousands of impact craters',
          'No moons or rings',
          'Experiences the greatest temperature variation'
        ]
      }
    },
    venus: {
      name: 'Venus',
      color: 0xFFC649,
      size: 3.8,
      texture: null,
      rotationSpeed: -0.001,
      info: {
        diameter: '12,104 km',
        distanceFromSun: '108.2 million km',
        orbitalPeriod: '225 Earth days',
        dayLength: '243 Earth days (retrograde)',
        temperature: '462°C average',
        moons: '0',
        atmosphere: '96.5% CO₂, thick clouds of sulfuric acid',
        composition: 'Rocky, similar to Earth',
        description: 'The hottest planet due to greenhouse effect. Named after the Roman goddess of love and beauty.',
        facts: [
          'Rotates backwards (retrograde rotation)',
          'Hottest planet despite not being closest to Sun',
          'Day longer than its year',
          'Atmospheric pressure 92x Earth\'s',
          'Called Earth\'s "sister planet" due to similar size'
        ]
      }
    },
    earth: {
      name: 'Earth',
      color: 0x2F6A8F,
      size: 4,
      texture: null,
      rotationSpeed: 0.005,
      info: {
        diameter: '12,742 km',
        distanceFromSun: '149.6 million km (1 AU)',
        orbitalPeriod: '365.25 days',
        dayLength: '24 hours',
        temperature: '-88°C to 58°C',
        moons: '1 (The Moon)',
        atmosphere: '78% N₂, 21% O₂, 1% other',
        composition: 'Rocky, iron core, liquid water',
        description: 'Our home planet, the only known world to harbor life. 71% covered by oceans.',
        facts: [
          'Only planet known to support life',
          '71% covered by water',
          'Has one large natural satellite (Moon)',
          'Atmosphere protects from cosmic radiation',
          'Magnetic field shields from solar wind'
        ]
      }
    },
    mars: {
      name: 'Mars',
      color: 0xCD5C5C,
      size: 3.4,
      texture: null,
      rotationSpeed: 0.005,
      info: {
        diameter: '6,779 km',
        distanceFromSun: '227.9 million km',
        orbitalPeriod: '687 Earth days',
        dayLength: '24.6 hours',
        temperature: '-87°C to -5°C',
        moons: '2 (Phobos, Deimos)',
        atmosphere: '95% CO₂, very thin',
        composition: 'Rocky, iron oxide (rust)',
        description: 'The Red Planet, named after the Roman god of war. Target for future human exploration.',
        facts: [
          'Has the largest volcano (Olympus Mons)',
          'Has the deepest canyon (Valles Marineris)',
          'Evidence of ancient rivers and lakes',
          'Two tiny moons: Phobos and Deimos',
          'Polar ice caps contain water and CO₂'
        ]
      }
    },
    jupiter: {
      name: 'Jupiter',
      color: 0xDAA520,
      size: 8,
      texture: null,
      rotationSpeed: 0.01,
      info: {
        diameter: '139,820 km',
        distanceFromSun: '778.5 million km',
        orbitalPeriod: '11.9 Earth years',
        dayLength: '9.9 hours',
        temperature: '-108°C average',
        moons: '95 known moons',
        atmosphere: '90% H₂, 10% He, traces of methane',
        composition: 'Gas giant, no solid surface',
        description: 'The largest planet, named after the king of Roman gods. Could fit all other planets inside it.',
        facts: [
          'Largest planet in Solar System',
          'Great Red Spot is a storm 2x Earth\'s size',
          'Has a faint ring system',
          '95 known moons including Europa (possible life)',
          'Protects inner planets from asteroids'
        ]
      }
    },
    saturn: {
      name: 'Saturn',
      color: 0xFAD5A5,
      size: 7.5,
      texture: null,
      rotationSpeed: 0.009,
      hasRings: true,
      info: {
        diameter: '116,460 km',
        distanceFromSun: '1.43 billion km',
        orbitalPeriod: '29.4 Earth years',
        dayLength: '10.7 hours',
        temperature: '-138°C average',
        moons: '146 known moons',
        atmosphere: '96% H₂, 3% He, traces of methane',
        composition: 'Gas giant, no solid surface',
        description: 'Known for its spectacular ring system. Named after the Roman god of agriculture.',
        facts: [
          'Most spectacular ring system',
          'Least dense planet (would float in water)',
          '146 known moons, Titan is largest',
          'Rings made of ice and rock particles',
          'Hexagonal storm at north pole'
        ]
      }
    },
    uranus: {
      name: 'Uranus',
      color: 0x4FD0E0,
      size: 6,
      texture: null,
      rotationSpeed: 0.007,
      info: {
        diameter: '50,724 km',
        distanceFromSun: '2.87 billion km',
        orbitalPeriod: '84 Earth years',
        dayLength: '17.2 hours (retrograde)',
        temperature: '-197°C average',
        moons: '27 known moons',
        atmosphere: '83% H₂, 15% He, 2% methane',
        composition: 'Ice giant, water/methane/ammonia',
        description: 'The tilted ice giant, rotates on its side. Named after the Greek god of the sky.',
        facts: [
          'Rotates on its side (98° tilt)',
          'Coldest planetary atmosphere',
          'Faint ring system',
          '27 moons named after Shakespeare characters',
          'Blue-green color from methane'
        ]
      }
    },
    neptune: {
      name: 'Neptune',
      color: 0x4166F5,
      size: 5.8,
      texture: null,
      rotationSpeed: 0.007,
      info: {
        diameter: '49,244 km',
        distanceFromSun: '4.5 billion km',
        orbitalPeriod: '164.8 Earth years',
        dayLength: '16.1 hours',
        temperature: '-201°C average',
        moons: '14 known moons',
        atmosphere: '80% H₂, 19% He, 1% methane',
        composition: 'Ice giant, water/methane/ammonia',
        description: 'The windiest planet with supersonic winds. Named after the Roman god of the sea.',
        facts: [
          'Fastest winds in Solar System (2,100 km/h)',
          'Most distant planet from Sun',
          'Dark spot storms like Jupiter',
          'Discovered by mathematical prediction',
          'Deep blue color from methane'
        ]
      }
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 20;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x667eea, 0.8, 100);
    pointLight2.position.set(-10, -5, -10);
    scene.add(pointLight2);

    // Stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    for (let i = 0; i < 3000; i++) {
      starsVertices.push(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Create initial planet
    createPlanet(selectedPlanet, scene);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (planetMeshRef.current) {
        const planetData = planetsData[selectedPlanet];
        planetMeshRef.current.rotation.y += planetData.rotationSpeed;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedPlanet]);

  const createPlanet = (planetKey, scene) => {
    // Remove existing planet
    if (planetMeshRef.current) {
      scene.remove(planetMeshRef.current);
    }

    const planetData = planetsData[planetKey];

    // Planet geometry
    const geometry = new THREE.SphereGeometry(planetData.size, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      color: planetData.color,
      roughness: 0.7,
      metalness: 0.2,
      emissive: planetData.color,
      emissiveIntensity: 0.1
    });

    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);
    planetMeshRef.current = planet;

    // Add rings for Saturn
    if (planetData.hasRings) {
      const ringGeometry = new THREE.RingGeometry(planetData.size * 1.4, planetData.size * 2.5, 128);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xe6d9b8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        roughness: 0.8,
        metalness: 0.1
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2.3; // Slight tilt for better visibility
      planet.add(ring);
      
      // Add inner ring detail
      const innerRingGeometry = new THREE.RingGeometry(planetData.size * 1.2, planetData.size * 1.35, 64);
      const innerRingMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5e6d3,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        roughness: 0.7,
        metalness: 0.2
      });
      const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
      innerRing.rotation.x = Math.PI / 2.3;
      planet.add(innerRing);
    }

    // Add atmosphere glow
    const glowGeometry = new THREE.SphereGeometry(planetData.size * 1.15, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: planetData.color,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    planet.add(glow);
  };

  const planet = planetsData[selectedPlanet];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #000510, #0a1128)',
      color: '#fff'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem 2rem',
        background: 'rgba(20, 10, 50, 0.9)',
        borderBottom: '2px solid rgba(102, 126, 234, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ color: '#667eea', textDecoration: 'none' }}>
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              3D Planet Explorer
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#b8c5ff', marginTop: '0.25rem' }}>
              Interactive 3D models of Solar System planets
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowInfo(!showInfo)}
          style={{
            padding: '0.75rem 1.5rem',
            background: showInfo ? '#667eea' : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600'
          }}
        >
          <Info size={20} />
          {showInfo ? 'Hide' : 'Show'} Info
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showInfo ? '300px 1fr 400px' : '300px 1fr', height: 'calc(100vh - 100px)' }}>
        {/* Planet Selection Sidebar */}
        <div style={{
          background: 'rgba(20, 10, 50, 0.9)',
          padding: '1.5rem',
          overflowY: 'auto',
          borderRight: '2px solid rgba(102, 126, 234, 0.3)'
        }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: '#667eea' }}>
            Select Planet
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(planetsData).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setSelectedPlanet(key)}
                style={{
                  padding: '1rem',
                  background: selectedPlanet === key
                    ? `linear-gradient(135deg, ${planetColorToHex(data.color)} 0%, ${planetColorToHex(data.color)}aa 100%)`
                    : 'rgba(255, 255, 255, 0.05)',
                  border: selectedPlanet === key
                    ? `2px solid ${planetColorToHex(data.color)}`
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: planetColorToHex(data.color),
                  flexShrink: 0
                }} />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{data.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#b8c5ff' }}>
                    {data.info.diameter}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3D View */}
        <div style={{ position: 'relative', background: '#000' }}>
          <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
          
          <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '1rem 2rem',
            borderRadius: '12px',
            border: '1px solid rgba(102, 126, 234, 0.5)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem' }}>
              {planet.name}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#b8c5ff', textAlign: 'center' }}>
              <RotateCw size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Drag to rotate • Scroll to zoom
            </div>
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div style={{
            background: 'rgba(20, 10, 50, 0.9)',
            padding: '2rem',
            overflowY: 'auto',
            borderLeft: '2px solid rgba(102, 126, 234, 0.3)'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: planetColorToHex(planet.color) }}>
              {planet.name}
            </h2>
            
            <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#d1d5db', marginBottom: '2rem' }}>
              {planet.info.description}
            </p>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard icon={<Ruler size={20} />} label="Diameter" value={planet.info.diameter} />
              <StatCard icon={<ZoomIn size={20} />} label="Distance from Sun" value={planet.info.distanceFromSun} />
              <StatCard icon={<RotateCw size={20} />} label="Orbital Period" value={planet.info.orbitalPeriod} />
              <StatCard icon={<RotateCw size={20} />} label="Day Length" value={planet.info.dayLength} />
              <StatCard icon={<Thermometer size={20} />} label="Temperature" value={planet.info.temperature} />
              <StatCard icon={<Users size={20} />} label="Moons" value={planet.info.moons} />
            </div>

            {/* Composition */}
            <div style={{
              padding: '1.5rem',
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#667eea' }}>
                Atmosphere
              </h4>
              <p style={{ fontSize: '0.95rem', color: '#d1d5db', margin: 0 }}>
                {planet.info.atmosphere}
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#667eea' }}>
                Composition
              </h4>
              <p style={{ fontSize: '0.95rem', color: '#d1d5db', margin: 0 }}>
                {planet.info.composition}
              </p>
            </div>

            {/* Fun Facts */}
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '12px'
            }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#ffc107' }}>
                🌟 Fun Facts
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#d1d5db' }}>
                {planet.info.facts.map((fact, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div style={{
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#b8c5ff' }}>
      {icon}
      <span style={{ fontSize: '0.85rem' }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>
      {value}
    </div>
  </div>
);

const planetColorToHex = (color) => {
  return '#' + color.toString(16).padStart(6, '0');
};

export default PlanetExplorer;
