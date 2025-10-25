import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ThermometerSun, Info, Globe, Atom } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EnhancedSolarSystem = () => {
  const [selectedPlanet, setSelectedPlanet] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeSpeed, setTimeSpeed] = useState(1); // Days per second
  const [tilt] = useState(60); // 60° tilt as requested
  const [showOrbits, setShowOrbits] = useState(true);
  const [showAsteroidBelt, setShowAsteroidBelt] = useState(true);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  // Reference epoch: J2000.0 (January 1, 2000, 12:00 TT)
  const J2000 = new Date('2000-01-01T12:00:00Z');

  // Ancient astronomy facts from Sūrya Siddhānta and Vaimānika Shāstra
  const ancientFacts = [
    {
      title: "Sūrya Siddhānta on Earth's Circumference",
      text: "Ancient Indian text calculated Earth's circumference as 4,967 yojanas (39,968 km), remarkably close to modern value of 40,075 km.",
      category: "Ancient Wisdom"
    },
    {
      title: "Vaimānika Shāstra on Atmospheric Layers",
      text: "Described 7 atmospheric layers called 'Kakshyas', similar to modern atmospheric stratification.",
      category: "Ancient Aviation"
    },
    {
      title: "Planetary Distances in Sūrya Siddhānta",
      text: "Calculated orbital periods of planets with remarkable accuracy, using yojanas as distance units.",
      category: "Ancient Calculation"
    }
  ];

  // Real astronomical data for planets
  const planets = [
    { 
      name: 'Mercury', 
      size: 30, 
      color: '#8C7853', 
      distance: 80, 
      orbitalPeriod: 87.97, // Earth days
      rotationPeriod: 58.65, // Earth days
      orbitSpeed: 47.87, // km/s
      temp: { day: 430, night: -180, avg: 167 },
      facts: ["Smallest planet", "No atmosphere", "Surface covered in craters", "One day = 176 Earth days"],
      atmosphere: "None - Solar wind stripped away"
    },
    { 
      name: 'Venus', 
      size: 45, 
      color: '#FFC649', 
      distance: 120, 
      orbitalPeriod: 224.70,
      rotationPeriod: -243.02, // Negative = retrograde rotation
      orbitSpeed: 35.02,
      temp: { day: 465, night: 465, avg: 465 },
      facts: ["Hottest planet", "Thick CO₂ atmosphere", "Rotates backwards", "Day longer than year"],
      atmosphere: "96.5% CO₂, extreme greenhouse effect"
    },
    { 
      name: 'Earth', 
      size: 48, 
      color: '#4A90E2', 
      distance: 160, 
      orbitalPeriod: 365.26,
      rotationPeriod: 1.0,
      orbitSpeed: 29.78,
      temp: { day: 58, night: -88, avg: 15 },
      facts: ["Only known planet with life", "71% water coverage", "Protective magnetic field", "One moon"],
      atmosphere: "78% N₂, 21% O₂, 1% other gases"
    },
    { 
      name: 'Mars', 
      size: 35, 
      color: '#E27B58', 
      distance: 200, 
      orbitalPeriod: 686.98,
      rotationPeriod: 1.03,
      orbitSpeed: 24.07,
      temp: { day: 20, night: -73, avg: -63 },
      facts: ["Red due to iron oxide", "Olympus Mons - largest volcano", "Polar ice caps", "Two moons"],
      atmosphere: "95% CO₂, thin atmosphere, dust storms"
    },
    { 
      name: 'Jupiter', 
      size: 90, 
      color: '#C88B3A', 
      distance: 280, 
      orbitalPeriod: 4332.59,
      rotationPeriod: 0.41,
      orbitSpeed: 13.07,
      temp: { day: -108, night: -108, avg: -108 },
      facts: ["Largest planet", "Great Red Spot storm", "79 known moons", "Strong radiation belts"],
      atmosphere: "90% H₂, 10% He, ammonia clouds"
    },
    { 
      name: 'Saturn', 
      size: 80, 
      color: '#FAD5A5', 
      distance: 360, 
      orbitalPeriod: 10759.22,
      rotationPeriod: 0.45,
      orbitSpeed: 9.69,
      temp: { day: -138, night: -138, avg: -138 },
      facts: ["Iconic ring system", "82 known moons", "Lowest density", "Hexagonal storm at north pole"],
      atmosphere: "96% H₂, 3% He, methane traces",
      hasRings: true
    },
    { 
      name: 'Uranus', 
      size: 60, 
      color: '#4FD0E7', 
      distance: 430, 
      orbitalPeriod: 30688.5,
      rotationPeriod: -0.72, // Retrograde
      orbitSpeed: 6.81,
      temp: { day: -197, night: -197, avg: -197 },
      facts: ["Rotates on its side", "Coldest planetary atmosphere", "13 known rings", "27 known moons"],
      atmosphere: "83% H₂, 15% He, 2% methane (blue color)"
    },
    { 
      name: 'Neptune', 
      size: 58, 
      color: '#4166F5', 
      distance: 490, 
      orbitalPeriod: 60182,
      rotationPeriod: 0.67,
      orbitSpeed: 5.43,
      temp: { day: -201, night: -201, avg: -201 },
      facts: ["Windiest planet", "Supersonic winds up to 2,100 km/h", "14 known moons", "Dark spots (storms)"],
      atmosphere: "80% H₂, 19% He, 1.5% methane"
    }
  ];

  // Black hole facts
  const cosmicFacts = {
    blackHoles: [
      "Black holes form when massive stars collapse",
      "Not even light can escape a black hole's gravity",
      "Time slows down near a black hole (time dilation)",
      "Supermassive black holes exist at galaxy centers",
      "Closest black hole: 1,560 light-years away"
    ],
    universe: [
      "Observable universe: 93 billion light-years diameter",
      "Estimated 2 trillion galaxies exist",
      "Universe is 13.8 billion years old",
      "Dark matter makes up 27% of universe",
      "Universe is expanding at accelerating rate"
    ]
  };

  // Time control
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = new Date(prev.getTime() + (timeSpeed * 24 * 60 * 60 * 1000)); // Add days
        return newTime;
      });
    }, 100); // Update every 100ms for smooth animation
    
    return () => clearInterval(interval);
  }, [isPlaying, timeSpeed]);

  const getDaysSinceJ2000 = (date) => {
    return (date.getTime() - J2000.getTime()) / (1000 * 60 * 60 * 24);
  };

  const getPlanetPosition = (planet) => {
    const daysSinceEpoch = getDaysSinceJ2000(currentTime);
    
    // Calculate orbital position (mean anomaly simplified)
    const orbitalAngle = (daysSinceEpoch / planet.orbitalPeriod) * 360;
    const angleRad = (orbitalAngle * Math.PI) / 180;
    
    // Calculate rotation
    const rotationAngle = (daysSinceEpoch / Math.abs(planet.rotationPeriod)) * 360;
    
    // Apply 60° tilt for better 3D perspective
    const tiltRad = (tilt * Math.PI) / 180;
    const x = 400 + Math.cos(angleRad) * planet.distance;
    const y = 350 + Math.sin(angleRad) * planet.distance * Math.cos(tiltRad);
    const z = Math.sin(angleRad) * planet.distance * Math.sin(tiltRad);
    
    return { 
      x, 
      y, 
      z, 
      scale: 1 - (z / 1000),
      rotationAngle: rotationAngle % 360,
      orbitalAngle: orbitalAngle % 360
    };
  };

  const handlePlanetClick = (planet) => {
    setSelectedInfo(planet);
    setShowDialog(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetToNow = () => {
    setCurrentTime(new Date());
    setIsPlaying(true);
  };

  const filteredPlanets = selectedPlanet === 'all'
    ? planets
    : planets.filter(p => p.name.toLowerCase() === selectedPlanet);

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" data-testid="back-button">
              <Button variant="outline" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(180,160,255,0.4)', color: '#e0e6ff' }}>
                <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back
              </Button>
            </Link>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fff', fontFamily: 'Orbitron' }}>
              Real-Time Solar System
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '250px' }}>
              <Select value={selectedPlanet} onValueChange={setSelectedPlanet}>
                <SelectTrigger style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(180,160,255,0.4)', color: '#fff' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#2d1b69', border: '1px solid rgba(180,160,255,0.4)' }}>
                  <SelectItem value="all">All Planets</SelectItem>
                  {planets.map(p => (
                    <SelectItem key={p.name.toLowerCase()} value={p.name.toLowerCase()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Time Machine Controls */}
        <Card style={{ background: 'rgba(20, 10, 50, 0.7)', border: '1px solid rgba(180,160,255,0.3)', padding: '1.5rem', marginBottom: '2rem', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ color: '#DDA0DD', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Simulation Date & Time</div>
              <div style={{ color: '#fff', fontSize: '1.3rem', fontFamily: 'monospace', fontWeight: '600' }}>
                {currentTime.toLocaleString()}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Button 
                onClick={handlePlayPause}
                style={{ background: isPlaying ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.1)', color: '#fff' }}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button onClick={resetToNow} variant="outline" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(180,160,255,0.3)', color: '#fff' }}>
                Reset to Now
              </Button>
              
              <Select value={timeSpeed.toString()} onValueChange={(v) => setTimeSpeed(parseFloat(v))}>
                <SelectTrigger style={{ width: '180px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(180,160,255,0.3)', color: '#fff' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#2d1b69', border: '1px solid rgba(180,160,255,0.4)' }}>
                  <SelectItem value="0.1">0.1x Speed (Real-time)</SelectItem>
                  <SelectItem value="1">1 Day/sec</SelectItem>
                  <SelectItem value="7">1 Week/sec</SelectItem>
                  <SelectItem value="30">1 Month/sec</SelectItem>
                  <SelectItem value="365">1 Year/sec</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          {/* Solar System Canvas */}
          <Card style={{ background: 'rgba(20, 10, 50, 0.7)', border: '1px solid rgba(180,160,255,0.3)', padding: '1rem', height: '700px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
            {/* Sun */}
            <div style={{
              position: 'absolute', left: '400px', top: '350px',
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #FFE484, #FDB813)',
              boxShadow: '0 0 60px rgba(255, 219, 88, 0.8), 0 0 100px rgba(255, 219, 88, 0.4)',
              transform: 'translate(-50%, -50%)', zIndex: 10
            }} />

            {/* Asteroid Belt */}
            {showAsteroidBelt && (
              <div style={{
                position: 'absolute', left: '400px', top: '350px',
                width: '440px', height: '440px',
                border: '2px dashed rgba(150, 150, 150, 0.3)',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
              }}>
                {[...Array(100)].map((_, i) => {
                  const angle = (i / 100) * Math.PI * 2;
                  const distance = 220 + (Math.random() * 20);
                  const x = Math.cos(angle) * distance;
                  const y = Math.sin(angle) * distance * 0.5;
                  return (
                    <div key={i} style={{
                      position: 'absolute',
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      width: '2px',
                      height: '2px',
                      background: '#888',
                      borderRadius: '50%'
                    }} />
                  );
                })}
              </div>
            )}

            {/* Planets */}
            {filteredPlanets.map(planet => {
              const pos = getPlanetPosition(planet);
              return (
                <div key={planet.name}>
                  {showOrbits && (
                    <div style={{
                      position: 'absolute', left: '400px', top: '350px',
                      width: planet.distance * 2 + 'px',
                      height: planet.distance + 'px',
                      border: '1px solid rgba(180, 160, 255, 0.2)',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none'
                    }} />
                  )}
                  
                  {/* Planet */}
                  <div
                    onClick={() => handlePlanetClick(planet)}
                    style={{
                      position: 'absolute',
                      left: pos.x + 'px',
                      top: pos.y + 'px',
                      width: planet.size * pos.scale + 'px',
                      height: planet.size * pos.scale + 'px',
                      borderRadius: '50%',
                      background: `radial-gradient(circle at 30% 30%, ${planet.color}dd, ${planet.color})`,
                      boxShadow: `0 0 ${20 * pos.scale}px ${planet.color}88`,
                      transform: `translate(-50%, -50%) rotate(${pos.rotationAngle}deg)`,
                      transition: 'all 0.1s linear',
                      zIndex: Math.floor((1 - pos.z / 1000) * 100),
                      cursor: 'pointer',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                    title={`${planet.name} - Orbital: ${pos.orbitalAngle.toFixed(1)}°`}
                  >
                    {/* Saturn's Rings */}
                    {planet.hasRings && (
                      <>
                        <div style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          width: `${planet.size * pos.scale * 2}px`,
                          height: `${planet.size * pos.scale * 0.4}px`,
                          border: '3px solid rgba(218, 188, 145, 0.6)',
                          borderRadius: '50%',
                          transform: 'translate(-50%, -50%)',
                          boxShadow: 'inset 0 0 10px rgba(218, 188, 145, 0.4)'
                        }} />
                        <div style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          width: `${planet.size * pos.scale * 1.6}px`,
                          height: `${planet.size * pos.scale * 0.3}px`,
                          border: '2px solid rgba(200, 170, 130, 0.5)',
                          borderRadius: '50%',
                          transform: 'translate(-50%, -50%)'
                        }} />
                      </>
                    )}
                    <div style={{
                      position: 'absolute',
                      top: '-25px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                    }}>
                      {planet.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Ancient Wisdom & Facts Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Card style={{ background: 'rgba(20, 10, 50, 0.7)', border: '1px solid rgba(180,160,255,0.3)', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Atom size={20} style={{ color: '#9370DB' }} />
                Ancient Astronomy
              </h3>
              {ancientFacts.map((fact, idx) => (
                <div key={idx} style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(147, 112, 219, 0.1)', borderRadius: '8px', border: '1px solid rgba(147, 112, 219, 0.3)' }}>
                  <div style={{ color: '#DDA0DD', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{fact.title}</div>
                  <div style={{ color: '#E6E6FA', fontSize: '0.85rem', lineHeight: '1.4' }}>{fact.text}</div>
                </div>
              ))}
            </Card>

            <Card style={{ background: 'rgba(20, 10, 50, 0.7)', border: '1px solid rgba(180,160,255,0.3)', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={20} style={{ color: '#9370DB' }} />
                Cosmic Facts
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ color: '#DDA0DD', fontWeight: '600', marginBottom: '0.5rem' }}>Black Holes:</div>
                {cosmicFacts.blackHoles.map((fact, idx) => (
                  <div key={idx} style={{ color: '#E6E6FA', fontSize: '0.85rem', marginBottom: '0.25rem', paddingLeft: '0.5rem' }}>• {fact}</div>
                ))}
              </div>
              <div>
                <div style={{ color: '#DDA0DD', fontWeight: '600', marginBottom: '0.5rem' }}>Universe:</div>
                {cosmicFacts.universe.map((fact, idx) => (
                  <div key={idx} style={{ color: '#E6E6FA', fontSize: '0.85rem', marginBottom: '0.25rem', paddingLeft: '0.5rem' }}>• {fact}</div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Planet Info Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent style={{ background: 'linear-gradient(135deg, #2d1b69 0%, #4a2c7d 100%)', border: '2px solid rgba(180,160,255,0.4)', color: '#fff', maxWidth: '600px' }}>
            <DialogHeader>
              <DialogTitle style={{ color: '#fff', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Globe size={32} style={{ color: selectedInfo?.color }} />
                {selectedInfo?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedInfo && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <ThermometerSun size={20} style={{ color: '#FF6B6B' }} />
                    <h4 style={{ color: '#DDA0DD', fontSize: '1.1rem' }}>Temperature Data</h4>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(180,160,255,0.2)' }}>
                    <div style={{ color: '#E6E6FA', marginBottom: '0.5rem' }}>Day: {selectedInfo.temp.day}°C</div>
                    <div style={{ color: '#E6E6FA', marginBottom: '0.5rem' }}>Night: {selectedInfo.temp.night}°C</div>
                    <div style={{ color: '#E6E6FA', fontWeight: '600' }}>Average: {selectedInfo.temp.avg}°C</div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#DDA0DD', marginBottom: '0.75rem', fontSize: '1.1rem' }}>Atmosphere</h4>
                  <div style={{ color: '#E6E6FA', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', lineHeight: '1.6', border: '1px solid rgba(180,160,255,0.2)' }}>
                    {selectedInfo.atmosphere}
                  </div>
                </div>

                <div>
                  <h4 style={{ color: '#DDA0DD', marginBottom: '0.75rem', fontSize: '1.1rem' }}>Interesting Facts</h4>
                  {selectedInfo.facts.map((fact, idx) => (
                    <div key={idx} style={{ color: '#E6E6FA', marginBottom: '0.5rem', paddingLeft: '1rem', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#9370DB' }}>•</span>
                      {fact}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EnhancedSolarSystem;
