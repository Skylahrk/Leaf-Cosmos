import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Play, Pause, RotateCcw, Zap, Info, ChevronUp, ChevronDown } from 'lucide-react';

const HelicalSolarSystem = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeSpeed, setTimeSpeed] = useState(3);
  const [showTrails, setShowTrails] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [forwardDistance, setForwardDistance] = useState(0);

  // Planet data with exaggerated but visible scales and VERY fast orbital speeds
  const planetData = [
    { name: 'Mercury', color: 0x8C7853, size: 0.4, distance: 4, speed: 50, trailColor: 0xFFAA00 },
    { name: 'Venus', color: 0xFFC649, size: 0.95, distance: 7, speed: 40, trailColor: 0xFFCC44 },
    { name: 'Earth', color: 0x2F6A8F, size: 1, distance: 10, speed: 30, trailColor: 0x00AAFF },
    { name: 'Mars', color: 0xCD5C5C, size: 0.53, distance: 15, speed: 25, trailColor: 0xFF4444 },
    { name: 'Jupiter', color: 0xDAA520, size: 2.5, distance: 25, speed: 15, trailColor: 0xFFAA44 },
    { name: 'Saturn', color: 0xFAD5A5, size: 2.1, distance: 35, speed: 12, trailColor: 0xFFDD77 },
    { name: 'Uranus', color: 0x4FD0E0, size: 1.6, distance: 45, speed: 8, trailColor: 0x44DDFF },
    { name: 'Neptune', color: 0x4166F5, size: 1.5, distance: 55, speed: 5, trailColor: 0x4444FF },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000511);
    scene.fog = new THREE.Fog(0x000511, 50, 200);
    sceneRef.current = scene;

    // Camera setup - side view to see helical motion clearly
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(80, 30, 0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 200;
    controlsRef.current = controls;

    // Add starfield background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.5,
      transparent: true,
      opacity: 0.8
    });

    const starsVertices = [];
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 400;
      const y = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 400;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Add Sun
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFDB813,
      emissive: 0xFDB813,
      emissiveIntensity: 1
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Add sun glow
    const glowGeometry = new THREE.SphereGeometry(4, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFA500,
      transparent: true,
      opacity: 0.3
    });
    const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(sunGlow);

    // Add sun light
    const sunLight = new THREE.PointLight(0xFFFFFF, 2, 200);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
    scene.add(ambientLight);

    // Create planets and trails
    const planets = [];
    const trails = [];
    const tiltAngle = -60 * (Math.PI / 180); // 60° tilt (realistic)

    // Sun trail to show its path through space
    const sunTrailGeometry = new THREE.BufferGeometry();
    const sunTrailPositions = new Float32Array(1500 * 3);
    sunTrailGeometry.setAttribute('position', new THREE.BufferAttribute(sunTrailPositions, 3));
    sunTrailGeometry.setDrawRange(0, 0);
    
    const sunTrailMaterial = new THREE.LineBasicMaterial({
      color: 0xFFAA00,
      transparent: true,
      opacity: 0.4,
      linewidth: 4
    });
    const sunTrail = new THREE.Line(sunTrailGeometry, sunTrailMaterial);
    scene.add(sunTrail);
    const sunTrailData = { line: sunTrail, positions: [], maxPoints: 500 };

    planetData.forEach((planetInfo) => {
      // Planet sphere with stronger glow
      const geometry = new THREE.SphereGeometry(planetInfo.size, 32, 32);
      const material = new THREE.MeshStandardMaterial({ 
        color: planetInfo.color,
        emissive: planetInfo.color,
        emissiveIntensity: 0.5,
        roughness: 0.5,
        metalness: 0.5
      });
      const planet = new THREE.Mesh(geometry, material);
      planet.userData = { ...planetInfo, angle: Math.random() * Math.PI * 2 };
      scene.add(planet);
      planets.push(planet);

      // Add planet glow for better visibility
      const glowGeometry = new THREE.SphereGeometry(planetInfo.size * 1.3, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: planetInfo.color,
        transparent: true,
        opacity: 0.3
      });
      const planetGlow = new THREE.Mesh(glowGeometry, glowMaterial);
      planet.add(planetGlow);

      // Orbit ring (static reference)
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const x = Math.cos(angle) * planetInfo.distance;
        const z = Math.sin(angle) * planetInfo.distance;
        orbitPoints.push(x, 0, z);
      }
      orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
      orbitGeometry.rotateX(tiltAngle);
      
      const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: planetInfo.trailColor,
        transparent: true,
        opacity: 0.2
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);

      // Trail for helical path - much longer trails for dramatic effect
      const trailGeometry = new THREE.BufferGeometry();
      const trailPositions = new Float32Array(1500 * 3); // 500 points for long trails
      trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      trailGeometry.setDrawRange(0, 0);
      
      const trailMaterial = new THREE.LineBasicMaterial({
        color: planetInfo.trailColor,
        transparent: true,
        opacity: 0.8,
        linewidth: 3
      });
      const trail = new THREE.Line(trailGeometry, trailMaterial);
      scene.add(trail);
      trails.push({ line: trail, positions: [], maxPoints: 500 });
    });

    // Add grid for depth perception
    const gridHelper = new THREE.GridHelper(200, 40, 0x444466, 0x222233);
    gridHelper.position.y = -20;
    scene.add(gridHelper);

    // Animation variables
    let time = 0;
    let forwardMotion = 0;
    const sunSpeed = 0.5; // Sun's forward speed through space - faster for more dramatic effect

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (isPlaying) {
        time += 0.01 * timeSpeed;
        forwardMotion += sunSpeed * timeSpeed;
        setForwardDistance(Math.floor(forwardMotion / 10));

        // Update sun position (moving forward through space)
        sun.position.z = -forwardMotion;
        sunGlow.position.z = -forwardMotion;
        sunLight.position.z = -forwardMotion;

        // Camera follows the sun to keep it centered
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, -forwardMotion);
        }

        // Update sun trail
        if (showTrails) {
          sunTrailData.positions.push(new THREE.Vector3(0, 0, -forwardMotion));
          
          if (sunTrailData.positions.length > sunTrailData.maxPoints) {
            sunTrailData.positions.shift();
          }
          
          const sunPositions = sunTrailData.line.geometry.attributes.position.array;
          sunTrailData.positions.forEach((pos, i) => {
            sunPositions[i * 3] = pos.x;
            sunPositions[i * 3 + 1] = pos.y;
            sunPositions[i * 3 + 2] = pos.z;
          });
          
          sunTrailData.line.geometry.attributes.position.needsUpdate = true;
          sunTrailData.line.geometry.setDrawRange(0, sunTrailData.positions.length);
        }

        // Update planets with helical motion
        planets.forEach((planet, index) => {
          const data = planet.userData;
          
          // Orbital motion - MUCH faster rotation for clearly visible spirals
          data.angle += 0.002 * data.speed * timeSpeed;
          
          // Position relative to sun with 60° tilt
          const x = Math.cos(data.angle) * data.distance;
          const y = Math.sin(data.angle) * data.distance * Math.sin(tiltAngle);
          const z = Math.sin(data.angle) * data.distance * Math.cos(tiltAngle) - forwardMotion;
          
          planet.position.set(x, y, z);
          
          // Update trail
          if (showTrails) {
            const trail = trails[index];
            trail.positions.push(new THREE.Vector3(x, y, z));
            
            if (trail.positions.length > trail.maxPoints) {
              trail.positions.shift();
            }
            
            const positions = trail.line.geometry.attributes.position.array;
            trail.positions.forEach((pos, i) => {
              positions[i * 3] = pos.x;
              positions[i * 3 + 1] = pos.y;
              positions[i * 3 + 2] = pos.z;
            });
            
            trail.line.geometry.attributes.position.needsUpdate = true;
            trail.line.geometry.setDrawRange(0, trail.positions.length);
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isPlaying, timeSpeed, showTrails]);

  const resetView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 50, 80);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(to bottom, #000511, #0a0e27)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 3D Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        color: '#fff',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          textShadow: '0 0 20px rgba(102, 126, 234, 0.8)'
        }}>
          How Solar System Really Moves
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#b8c5ff',
          textShadow: '0 2px 10px rgba(0,0,0,0.8)'
        }}>
          Helical motion through the Milky Way galaxy
        </p>
      </div>

      {/* Controls Panel */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(20, 10, 50, 0.9)',
        border: '2px solid rgba(180, 160, 255, 0.4)',
        borderRadius: '20px',
        padding: '1.5rem 2rem',
        backdropFilter: 'blur(15px)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        zIndex: 10
      }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: '0.75rem 1.5rem',
            background: isPlaying ? '#ef4444' : '#10b981',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          {isPlaying ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Play</>}
        </button>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'rgba(102, 126, 234, 0.2)',
          borderRadius: '12px'
        }}>
          <Zap size={20} color="#667eea" />
          <span style={{ color: '#fff', fontSize: '0.9rem' }}>Speed: {timeSpeed}x</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <button
              onClick={() => setTimeSpeed(Math.min(timeSpeed + 0.5, 10))}
              style={{
                padding: '0.25rem 0.5rem',
                background: 'rgba(102, 126, 234, 0.3)',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={() => setTimeSpeed(Math.max(timeSpeed - 0.5, 0.5))}
              style={{
                padding: '0.25rem 0.5rem',
                background: 'rgba(102, 126, 234, 0.3)',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowTrails(!showTrails)}
          style={{
            padding: '0.75rem 1.5rem',
            background: showTrails ? 'rgba(102, 126, 234, 0.5)' : 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(102, 126, 234, 0.4)',
            borderRadius: '12px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          {showTrails ? '✓' : ''} Trails
        </button>

        <button
          onClick={resetView}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          <RotateCcw size={20} /> Reset View
        </button>

        <button
          onClick={() => setShowInfo(!showInfo)}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          <Info size={20} />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div style={{
          position: 'absolute',
          top: '6rem',
          right: '2rem',
          background: 'rgba(20, 10, 50, 0.9)',
          border: '2px solid rgba(180, 160, 255, 0.4)',
          borderRadius: '20px',
          padding: '1.5rem',
          backdropFilter: 'blur(15px)',
          maxWidth: '350px',
          color: '#fff',
          zIndex: 10
        }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#667eea' }}>
            About Helical Motion
          </h3>
          <div style={{ fontSize: '0.9rem', color: '#b8c5ff', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#fff' }}>Realistic Motion:</strong> Our solar system orbits the Milky Way at ~70,000 km/h, taking 226 million years per revolution.
            </p>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#fff' }}>60° Tilt:</strong> Planetary orbits are tilted 60° to the Sun's direction of travel through the galaxy.
            </p>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#fff' }}>Spiral Paths:</strong> Planets trace helical (corkscrew) patterns through space, not simple circles.
            </p>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#fff' }}>Distance Traveled:</strong> {forwardDistance} units through the galaxy
            </p>
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(102, 126, 234, 0.2)',
              borderRadius: '8px',
              fontSize: '0.85rem'
            }}>
              💡 Drag to rotate • Scroll to zoom • Click trails to toggle
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelicalSolarSystem;
