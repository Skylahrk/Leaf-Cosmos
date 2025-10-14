import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const Constellations3D = () => {
  const canvasRef = useRef(null);
  const [selectedConstellation, setSelectedConstellation] = useState('orion');
  const [rotationX, setRotationX] = useState(20);
  const [rotationY, setRotationY] = useState(45);
  const [zoom, setZoom] = useState(1);
  const [autoRotate, setAutoRotate] = useState(false);

  // Constellation data with 3D coordinates (x, y, z in space)
  const constellations = {
    orion: {
      name: 'Orion',
      description: 'The Hunter - One of the most recognizable constellations',
      stars: [
        { name: 'Betelgeuse', x: -100, y: 150, z: 50, brightness: 0.5, color: '#ff6b6b' },
        { name: 'Rigel', x: 50, y: -150, z: 30, brightness: 0.13, color: '#4a90e2' },
        { name: 'Bellatrix', x: -120, y: 80, z: -20, brightness: 1.64, color: '#ffffff' },
        { name: 'Mintaka', x: -30, y: 0, z: 40, brightness: 2.23, color: '#b0d4ff' },
        { name: 'Alnilam', x: 0, y: 0, z: 35, brightness: 1.69, color: '#b0d4ff' },
        { name: 'Alnitak', x: 30, y: 0, z: 38, brightness: 1.79, color: '#b0d4ff' },
        { name: 'Saiph', x: 80, y: -120, z: -15, brightness: 2.06, color: '#b0d4ff' }
      ],
      lines: [
        [0, 2], [2, 3], [3, 4], [4, 5], [5, 1], [1, 6], [0, 3], [6, 5]
      ]
    },
    ursa_major: {
      name: 'Ursa Major',
      description: 'The Great Bear - Contains the Big Dipper asterism',
      stars: [
        { name: 'Dubhe', x: -80, y: 100, z: 20, brightness: 1.79, color: '#ffaa00' },
        { name: 'Merak', x: -40, y: 80, z: 15, brightness: 2.37, color: '#ffffff' },
        { name: 'Phecda', x: 20, y: 60, z: 10, brightness: 2.44, color: '#ffffff' },
        { name: 'Megrez', x: 60, y: 50, z: 5, brightness: 3.31, color: '#ffffff' },
        { name: 'Alioth', x: 100, y: 30, z: 0, brightness: 1.77, color: '#ffffff' },
        { name: 'Mizar', x: 120, y: 0, z: -10, brightness: 2.04, color: '#ffffff' },
        { name: 'Alkaid', x: 140, y: -40, z: -20, brightness: 1.86, color: '#b0d4ff' }
      ],
      lines: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]
      ]
    },
    cassiopeia: {
      name: 'Cassiopeia',
      description: 'The Queen - Distinctive W or M shape',
      stars: [
        { name: 'Caph', x: -120, y: 80, z: 25, brightness: 2.27, color: '#ffffff' },
        { name: 'Schedar', x: -60, y: 40, z: 15, brightness: 2.23, color: '#ffaa00' },
        { name: 'Navi', x: 0, y: 0, z: 0, brightness: 2.47, color: '#ffffff' },
        { name: 'Ruchbah', x: 60, y: 30, z: -10, brightness: 2.68, color: '#ffffff' },
        { name: 'Segin', x: 120, y: 70, z: -20, brightness: 3.38, color: '#b0d4ff' }
      ],
      lines: [
        [0, 1], [1, 2], [2, 3], [3, 4]
      ]
    },
    leo: {
      name: 'Leo',
      description: 'The Lion - Spring constellation representing courage',
      stars: [
        { name: 'Regulus', x: 0, y: -80, z: 10, brightness: 1.35, color: '#b0d4ff' },
        { name: 'Denebola', x: 140, y: 60, z: -15, brightness: 2.14, color: '#ffffff' },
        { name: 'Algieba', x: -60, y: -40, z: 20, brightness: 2.08, color: '#ffaa00' },
        { name: 'Zosma', x: 80, y: 40, z: 5, brightness: 2.56, color: '#ffffff' },
        { name: 'Chertan', x: 100, y: -20, z: 0, brightness: 3.32, color: '#ffffff' }
      ],
      lines: [
        [0, 2], [0, 4], [4, 3], [3, 1], [2, 3]
      ]
    },
    cygnus: {
      name: 'Cygnus',
      description: 'The Swan - Also known as the Northern Cross',
      stars: [
        { name: 'Deneb', x: 0, y: 120, z: 30, brightness: 1.25, color: '#ffffff' },
        { name: 'Albireo', x: 0, y: -120, z: -20, brightness: 3.08, color: '#ffaa00' },
        { name: 'Sadr', x: 0, y: 0, z: 0, brightness: 2.20, color: '#ffffff' },
        { name: 'Gienah', x: -100, y: 20, z: 10, brightness: 2.46, color: '#ffffff' },
        { name: 'Delta Cygni', x: 100, y: 40, z: -5, brightness: 2.87, color: '#b0d4ff' }
      ],
      lines: [
        [0, 2], [2, 1], [2, 3], [2, 4]
      ]
    },
    scorpius: {
      name: 'Scorpius',
      description: 'The Scorpion - Summer constellation with bright Antares',
      stars: [
        { name: 'Antares', x: -40, y: 0, z: 0, brightness: 1.09, color: '#ff6b6b' },
        { name: 'Shaula', x: 100, y: -100, z: -30, brightness: 1.63, color: '#b0d4ff' },
        { name: 'Sargas', x: 80, y: -60, z: -20, brightness: 1.87, color: '#ffffff' },
        { name: 'Dschubba', x: -80, y: 60, z: 15, brightness: 2.32, color: '#b0d4ff' },
        { name: 'Lesath', x: 110, y: -110, z: -35, brightness: 2.69, color: '#b0d4ff' }
      ],
      lines: [
        [3, 0], [0, 2], [2, 1], [1, 4]
      ]
    }
  };

  useEffect(() => {
    drawConstellation3D();
  }, [selectedConstellation, rotationX, rotationY, zoom]);

  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotationY(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [autoRotate]);

  const project3DTo2D = (x, y, z, width, height) => {
    // Apply rotation
    const angleX = (rotationX * Math.PI) / 180;
    const angleY = (rotationY * Math.PI) / 180;

    // Rotate around Y axis
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    // Rotate around X axis
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    // Apply zoom
    const scale = zoom;
    
    // Perspective projection
    const distance = 400;
    const perspective = distance / (distance + z2);

    return {
      x: width / 2 + x1 * scale * perspective,
      y: height / 2 - y1 * scale * perspective,
      z: z2,
      scale: perspective
    };
  };

  const drawConstellation3D = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, width, height);

    // Draw starfield background
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const constellation = constellations[selectedConstellation];
    if (!constellation) return;

    // Project all stars to 2D
    const projectedStars = constellation.stars.map(star => ({
      ...star,
      projected: project3DTo2D(star.x, star.y, star.z, width, height)
    }));

    // Sort by z-depth (back to front)
    const sortedStars = [...projectedStars].sort((a, b) => a.projected.z - b.projected.z);

    // Draw constellation lines first (behind stars)
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.6)';
    ctx.lineWidth = 2;
    constellation.lines.forEach(line => {
      const star1 = projectedStars[line[0]];
      const star2 = projectedStars[line[1]];
      
      const avgZ = (star1.projected.z + star2.projected.z) / 2;
      const lineOpacity = Math.max(0.3, Math.min(1, 1 - avgZ / 400));
      
      ctx.save();
      ctx.globalAlpha = lineOpacity;
      ctx.beginPath();
      ctx.moveTo(star1.projected.x, star1.projected.y);
      ctx.lineTo(star2.projected.x, star2.projected.y);
      ctx.stroke();
      ctx.restore();
    });

    // Draw stars
    sortedStars.forEach(star => {
      const pos = star.projected;
      const baseSize = 6 - star.brightness;
      const size = baseSize * pos.scale * zoom;
      const opacity = Math.max(0.5, Math.min(1, 1 - pos.z / 400));

      // Star glow
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 3);
      gradient.addColorStop(0, star.color + 'ff');
      gradient.addColorStop(0.5, star.color + '80');
      gradient.addColorStop(1, star.color + '00');
      
      ctx.save();
      ctx.globalAlpha = opacity * 0.8;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Star core
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Star name
      if (size > 3) {
        ctx.save();
        ctx.globalAlpha = opacity * 0.9;
        ctx.fillStyle = '#e0e6ff';
        ctx.font = `${Math.floor(10 * pos.scale)}px Space Grotesk`;
        ctx.fillText(star.name, pos.x + size + 5, pos.y - 5);
        ctx.restore();
      }
    });

    // Draw constellation name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Orbitron';
    ctx.fillText(constellation.name, 20, 40);
    
    ctx.fillStyle = '#b8c5ff';
    ctx.font = '14px Space Grotesk';
    ctx.fillText(constellation.description, 20, 65);
  };

  const resetView = () => {
    setRotationX(20);
    setRotationY(45);
    setZoom(1);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" data-testid="back-button">
            <Button variant="outline" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.3)', color: '#e0e6ff' }}>
              <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back
            </Button>
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fff', fontFamily: 'Orbitron' }} data-testid="3d-constellations-title">
            3D Constellation Viewer
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.2rem' }}>Select Constellation</h3>
              <Select value={selectedConstellation} onValueChange={setSelectedConstellation}>
                <SelectTrigger style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }} data-testid="constellation-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#1a1f3a', border: '1px solid rgba(120,140,255,0.3)' }}>
                  <SelectItem value="orion">Orion - The Hunter</SelectItem>
                  <SelectItem value="ursa_major">Ursa Major - Great Bear</SelectItem>
                  <SelectItem value="cassiopeia">Cassiopeia - The Queen</SelectItem>
                  <SelectItem value="leo">Leo - The Lion</SelectItem>
                  <SelectItem value="cygnus">Cygnus - The Swan</SelectItem>
                  <SelectItem value="scorpius">Scorpius - The Scorpion</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.2rem' }}>3D Controls</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#b8c5ff', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                  Rotation X: {rotationX}°
                </label>
                <Slider
                  value={[rotationX]}
                  onValueChange={(v) => setRotationX(v[0])}
                  min={-90}
                  max={90}
                  step={1}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#b8c5ff', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                  Rotation Y: {rotationY}°
                </label>
                <Slider
                  value={[rotationY]}
                  onValueChange={(v) => setRotationY(v[0])}
                  min={0}
                  max={360}
                  step={1}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#b8c5ff', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                  Zoom: {zoom.toFixed(1)}x
                </label>
                <Slider
                  value={[zoom]}
                  onValueChange={(v) => setZoom(v[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  onClick={() => setAutoRotate(!autoRotate)}
                  style={{ flex: 1, background: autoRotate ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.1)', color: '#fff' }}
                  data-testid="auto-rotate-button"
                >
                  {autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
                </Button>
                <Button
                  onClick={resetView}
                  variant="outline"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }}
                  data-testid="reset-view-button"
                >
                  <RotateCcw size={20} />
                </Button>
              </div>
            </Card>

            <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.2rem' }}>Stars in {constellations[selectedConstellation]?.name}</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {constellations[selectedConstellation]?.stars.map((star, idx) => (
                  <div key={idx} style={{ padding: '0.5rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ color: '#fff', fontWeight: '600' }}>{star.name}</div>
                    <div style={{ color: '#788cff', fontSize: '0.85rem' }}>
                      Magnitude: {star.brightness.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 3D Canvas */}
          <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem' }}>
            <canvas
              ref={canvasRef}
              width={1200}
              height={800}
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
              data-testid="constellation-3d-canvas"
            />
            <div style={{ marginTop: '1rem', color: '#b8c5ff', fontSize: '0.9rem', textAlign: 'center' }}>
              Use the sliders to rotate and zoom • Auto Rotate for continuous animation
            </div>
          </Card>
        </div>

        {/* Constellation Facts */}
        <Card style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem' }}>Constellation Facts</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
            {Object.entries(constellations).map(([key, constellation]) => (
              <div key={key} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: selectedConstellation === key ? '2px solid rgba(102, 126, 234, 0.5)' : 'none' }}>
                <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{constellation.name}</h4>
                <p style={{ color: '#b8c5ff', lineHeight: '1.5', marginBottom: '0.5rem' }}>{constellation.description}</p>
                <p style={{ color: '#788cff', fontSize: '0.9rem' }}>Stars: {constellation.stars.length}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Constellations3D;
