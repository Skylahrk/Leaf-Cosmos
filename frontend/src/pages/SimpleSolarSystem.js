import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const SimpleSolarSystem = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000511);

    // Camera - side view to clearly see helical motion like the viral video
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(100, 20, 0);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    for (let i = 0; i < 3000; i++) {
      starsVertices.push(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400
      );
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.5 });
    scene.add(new THREE.Points(starsGeometry, starsMaterial));

    // Sun with dramatic glow like the viral video
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFDB813,
      emissive: 0xFDB813,
      emissiveIntensity: 1
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Sun glow
    const glowGeometry = new THREE.SphereGeometry(5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFA500,
      transparent: true,
      opacity: 0.3
    });
    const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(sunGlow);

    // Sun light
    const sunLight = new THREE.PointLight(0xFFFFFF, 2, 200);
    scene.add(sunLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
    scene.add(ambientLight);

    // Planets - matching viral video style with dramatic motion
    const planetsData = [
      { name: 'Mercury', color: 0xFF6B35, size: 0.8, distance: 6, speed: 15, trailColor: 0xFF6B35 },
      { name: 'Venus', color: 0xFFC649, size: 1.2, distance: 9, speed: 12, trailColor: 0xFFDD77 },
      { name: 'Earth', color: 0x4A90E2, size: 1.3, distance: 12, speed: 10, trailColor: 0x00AAFF },
      { name: 'Mars', color: 0xE63946, size: 0.9, distance: 16, speed: 8, trailColor: 0xFF4466 },
      { name: 'Jupiter', color: 0xF4A261, size: 3.5, distance: 24, speed: 4, trailColor: 0xFFAA44 },
      { name: 'Saturn', color: 0xE9C46A, size: 3, distance: 32, speed: 3, trailColor: 0xFFDD77 },
      { name: 'Uranus', color: 0x4ECDC4, size: 2.2, distance: 40, speed: 2, trailColor: 0x44DDFF },
      { name: 'Neptune', color: 0x2A9D8F, size: 2.1, distance: 48, speed: 1.5, trailColor: 0x44AAFF },
    ];

    const planets = [];
    const trails = [];
    const tilt = -60 * (Math.PI / 180); // 60 degree tilt
    
    planetsData.forEach((data, i) => {
      // Orbital ring
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints = [];
      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2;
        orbitPoints.push(
          Math.cos(angle) * data.distance,
          0,
          Math.sin(angle) * data.distance
        );
      }
      orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
      orbitGeometry.rotateX(tilt);
      const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: data.trailColor || data.color, 
        transparent: true, 
        opacity: 0.15 
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);
      

      const geometry = new THREE.SphereGeometry(data.size, 32, 32);
      const material = new THREE.MeshStandardMaterial({ 
        color: data.color,
        emissive: data.color,
        emissiveIntensity: 0.5
      });
      const planet = new THREE.Mesh(geometry, material);
      
      // Store angle directly on the mesh
      planet.angle = (i / planetsData.length) * Math.PI * 2;
      planet.distance = data.distance;
      planet.speed = data.speed;
      
      scene.add(planet);
      planets.push(planet);

      // Trail - much longer and more dramatic like the viral video
      const trailGeometry = new THREE.BufferGeometry();
      const trailPositions = new Float32Array(1000 * 3);
      trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      const trailMaterial = new THREE.LineBasicMaterial({ 
        color: data.trailColor || data.color, 
        transparent: true, 
        opacity: 0.8,
        linewidth: 2
      });
      const trail = new THREE.Line(trailGeometry, trailMaterial);
      scene.add(trail);
      trails.push({ line: trail, positions: [], maxPoints: 300 });
    });

    // Animation variables
    let forwardMotion = 0;
    let animationId;

    // Add grid for depth perception like the viral video
    const gridHelper = new THREE.GridHelper(200, 40, 0x444466, 0x222233);
    gridHelper.position.y = -15;
    scene.add(gridHelper);

    // Animation loop - faster forward motion
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      forwardMotion += 0.5; // Faster forward motion

      // Update sun position
      sun.position.z = -forwardMotion;
      sunGlow.position.z = -forwardMotion;
      sunLight.position.z = -forwardMotion;

      // Update planets - faster orbital motion for dramatic effect
      planets.forEach((planet, index) => {
        // Increment angle - faster for more visible spirals!
        planet.angle += 0.015 * planet.speed;
        
        // Calculate position with helical motion
        const tilt = -60 * (Math.PI / 180);
        const x = Math.cos(planet.angle) * planet.distance;
        const y = Math.sin(planet.angle) * planet.distance * Math.sin(tilt);
        const z = Math.sin(planet.angle) * planet.distance * Math.cos(tilt) - forwardMotion;
        
        // SET THE POSITION - this is critical!
        planet.position.x = x;
        planet.position.y = y;
        planet.position.z = z;

        // Update trail
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
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#fff',
        fontSize: '2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        pointerEvents: 'none',
        textShadow: '0 0 20px rgba(102, 126, 234, 0.8)'
      }}>
        Simple Test - Planets MUST Move
      </div>
    </div>
  );
};

export default SimpleSolarSystem;
