import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Play, Pause, FastForward, Rewind, RotateCcw, Calendar as CalendarIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as satellite from 'satellite.js';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdvancedSkyMap = () => {
  const canvasRef = useRef(null);
  
  // Location & Time
  const [latitude, setLatitude] = useState(40.7128);
  const [longitude, setLongitude] = useState(-74.0060);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Time Controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1); // 1 = real-time, 60 = 1 min/sec, etc.
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  
  // Celestial Data
  const [planets, setPlanets] = useState({});
  const [stars, setStars] = useState([]);
  const [brightStars, setBrightStars] = useState([]);
  const [deepSkyObjects, setDeepSkyObjects] = useState([]);
  const [satellites, setSatellites] = useState([]);
  const [constellations, setConstellations] = useState([]);
  
  // Visualization Options
  const [showConstellationLines, setShowConstellationLines] = useState(true);
  const [showConstellationArt, setShowConstellationArt] = useState(false);
  const [showEquatorialGrid, setShowEquatorialGrid] = useState(false);
  const [showHorizontalGrid, setShowHorizontalGrid] = useState(true);
  const [showMilkyWay, setShowMilkyWay] = useState(true);
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [showSatellites, setShowSatellites] = useState(true);
  const [showDeepSky, setShowDeepSky] = useState(true);
  const [lightPollution, setLightPollution] = useState(3); // 1-9 Bortle scale
  const [magnitudeLimit, setMagnitudeLimit] = useState(6);
  
  // Telescope FOV
  const [fovEnabled, setFovEnabled] = useState(false);
  const [fovSize, setFovSize] = useState(5); // degrees
  
  const [loading, setLoading] = useState(false);

  // Initialize
  useEffect(() => {
    fetchConstellations();
    fetchDeepSkyObjects();
    initSatelliteTracking();
    
    // Initial sky data fetch
    fetchSkyData();
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => console.log('Geolocation error:', error)
      );
    }
  }, []);

  // Time machine - update currentTime based on play state and speed
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = new Date(prev.getTime() + (1000 * speedMultiplier));
        return newTime;
      });
    }, 50); // Update every 50ms for smooth animation
    
    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  // Update sky when time changes (debounced) - only for major time changes
  useEffect(() => {
    // Don't auto-fetch, let user click Update button
    drawAdvancedSkyMap(); // Just redraw the canvas
  }, [currentTime]);

  // Draw canvas whenever data updates
  useEffect(() => {
    if (planets && stars && brightStars) {
      drawAdvancedSkyMap();
    }
  }, [planets, stars, brightStars, deepSkyObjects, satellites, showConstellationLines, 
      showEquatorialGrid, showHorizontalGrid, showMilkyWay, showAtmosphere, 
      showSatellites, showDeepSky, lightPollution, fovEnabled, fovSize]);

  const fetchConstellations = async () => {
    try {
      const response = await axios.get(`${API}/constellations`);
      setConstellations(response.data);
    } catch (error) {
      console.error('Error fetching constellations:', error);
    }
  };

  const fetchDeepSkyObjects = () => {
    // Messier catalog - most famous deep sky objects
    const messierObjects = [
      { name: 'M31', type: 'Galaxy', ra: 10.68, dec: 41.27, mag: 3.4, size: 190, constellation: 'Andromeda' },
      { name: 'M42', type: 'Nebula', ra: 83.82, dec: -5.39, mag: 4.0, size: 85, constellation: 'Orion' },
      { name: 'M45', type: 'Cluster', ra: 56.75, dec: 24.12, mag: 1.6, size: 110, constellation: 'Taurus' },
      { name: 'M13', type: 'Cluster', ra: 250.42, dec: 36.46, mag: 5.8, size: 20, constellation: 'Hercules' },
      { name: 'M51', type: 'Galaxy', ra: 202.47, dec: 47.20, mag: 8.4, size: 11, constellation: 'Canes Venatici' },
      { name: 'M57', type: 'Nebula', ra: 283.40, dec: 33.03, mag: 8.8, size: 1.4, constellation: 'Lyra' },
      { name: 'M1', type: 'Nebula', ra: 83.63, dec: 22.01, mag: 8.4, size: 6, constellation: 'Taurus' },
      { name: 'M27', type: 'Nebula', ra: 299.90, dec: 22.72, mag: 7.5, size: 8, constellation: 'Vulpecula' },
      { name: 'M33', type: 'Galaxy', ra: 23.46, dec: 30.66, mag: 5.7, size: 73, constellation: 'Triangulum' },
      { name: 'M81', type: 'Galaxy', ra: 148.89, dec: 69.07, mag: 6.9, size: 27, constellation: 'Ursa Major' }
    ];
    setDeepSkyObjects(messierObjects);
  };

  const initSatelliteTracking = async () => {
    // Sample TLE data for ISS
    const issTLE = {
      name: 'ISS',
      tle1: '1 25544U 98067A   25286.50000000  .00016717  00000-0  10270-3 0  9005',
      tle2: '2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391467295'
    };
    
    setSatellites([issTLE]);
  };

  const calculateSatellitePosition = (tle, time) => {
    try {
      const satrec = satellite.twoline2satrec(tle.tle1, tle.tle2);
      const positionAndVelocity = satellite.propagate(satrec, time);
      
      if (positionAndVelocity.position) {
        const gmst = satellite.gstime(time);
        const position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
        
        return {
          latitude: satellite.degreesLat(position.latitude),
          longitude: satellite.degreesLong(position.longitude),
          altitude: position.height
        };
      }
    } catch (error) {
      console.error('Satellite calculation error:', error);
    }
    return null;
  };

  const fetchSkyData = async () => {
    setLoading(true);
    try {
      const locationData = {
        latitude,
        longitude,
        datetime: currentTime.toISOString()
      };

      const [planetsRes, starsRes] = await Promise.all([
        axios.post(`${API}/planets/positions`, locationData, { timeout: 10000 }),
        axios.post(`${API}/stars/visible`, locationData, { timeout: 10000 })
      ]);

      setPlanets(planetsRes.data);
      
      // Generate more stars based on magnitude limit
      const generatedStars = generateStarField(magnitudeLimit);
      setStars(generatedStars);
      setBrightStars(starsRes.data);
      
      console.log('Sky data loaded successfully');
    } catch (error) {
      console.error('Error fetching sky data:', error);
      // Still generate stars even if API fails
      const generatedStars = generateStarField(magnitudeLimit);
      setStars(generatedStars);
    } finally {
      setLoading(false);
    }
  };

  const generateStarField = (magLimit) => {
    // Generate procedural stars - in production would load from HYG database
    const stars = [];
    const starCount = Math.min(10000, Math.pow(10, magLimit - 1) * 100);
    
    for (let i = 0; i < starCount; i++) {
      stars.push({
        ra: Math.random() * 360,
        dec: (Math.random() * 180) - 90,
        magnitude: Math.random() * magLimit,
        azimuth: Math.random() * 360,
        altitude: Math.random() * 90
      });
    }
    return stars;
  };

  const drawAdvancedSkyMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Atmosphere effect
    if (showAtmosphere) {
      const hour = currentTime.getHours();
      const isDaytime = hour >= 6 && hour <= 18;
      
      if (isDaytime) {
        // Daytime sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#4da3ff');
        gradient.addColorStop(1, '#b3d9ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        return; // Don't show stars in daylight
      } else {
        // Twilight effects
        const isTwilight = (hour >= 5 && hour < 7) || (hour >= 18 && hour < 20);
        if (isTwilight) {
          const twilightGradient = ctx.createLinearGradient(0, height, 0, 0);
          twilightGradient.addColorStop(0, '#ff6b35');
          twilightGradient.addColorStop(0.3, '#004e7c');
          twilightGradient.addColorStop(1, '#000814');
          ctx.fillStyle = twilightGradient;
          ctx.fillRect(0, 0, width, height);
        }
      }
    }

    // Milky Way band
    if (showMilkyWay) {
      ctx.save();
      ctx.globalAlpha = 0.3 - (lightPollution * 0.03);
      const milkyWayGradient = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, width/2);
      milkyWayGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      milkyWayGradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.1)');
      milkyWayGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = milkyWayGradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // Coordinate grids
    if (showEquatorialGrid || showHorizontalGrid) {
      drawCoordinateGrids(ctx, width, height);
    }

    // Draw generated star field
    ctx.globalAlpha = Math.max(0.1, 1 - (lightPollution * 0.1));
    stars.forEach(star => {
      if (star.magnitude <= magnitudeLimit && star.altitude > 0) {
        const x = (star.azimuth / 360) * width;
        const y = height - ((star.altitude / 90) * height);
        const size = Math.max(0.5, 3 - star.magnitude / 2);
        const brightness = 1 - (star.magnitude / magnitudeLimit);
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;

    // Draw bright named stars
    brightStars.forEach(star => {
      const x = (star.azimuth / 360) * width;
      const y = height - ((star.altitude / 90) * height);
      const size = Math.max(3, 8 - star.magnitude);
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      
      // Star glow
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Star names
      ctx.fillStyle = '#e0e6ff';
      ctx.font = '11px Space Grotesk';
      ctx.fillText(star.name, x + 10, y - 10);
    });

    // Draw constellation lines
    if (showConstellationLines) {
      drawConstellationLines(ctx, width, height);
    }

    // Draw deep sky objects
    if (showDeepSky) {
      deepSkyObjects.forEach(dso => {
        // Calculate position (simplified - would need proper coordinate transformation)
        const x = (dso.ra / 360) * width;
        const y = height / 2; // Simplified positioning
        
        ctx.save();
        ctx.strokeStyle = dso.type === 'Galaxy' ? '#ff6b9d' : 
                         dso.type === 'Nebula' ? '#4ade80' : '#60a5fa';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        
        if (dso.type === 'Galaxy') {
          ctx.beginPath();
          ctx.ellipse(x, y, 8, 5, Math.PI / 4, 0, Math.PI * 2);
          ctx.stroke();
        } else if (dso.type === 'Nebula') {
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = ctx.strokeStyle;
          ctx.fill();
        } else {
          // Cluster
          for (let i = 0; i < 6; i++) {
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = '10px Space Grotesk';
        ctx.fillText(dso.name, x + 15, y);
        ctx.restore();
      });
    }

    // Draw satellites
    if (showSatellites) {
      satellites.forEach(sat => {
        const pos = calculateSatellitePosition(sat, currentTime);
        if (pos) {
          // Convert to screen coordinates (simplified)
          const x = width / 2 + (pos.longitude * 2);
          const y = height / 2 - (pos.latitude * 2);
          
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#ff0000';
          ctx.font = '10px Space Grotesk';
          ctx.fillText(sat.name, x + 10, y);
        }
      });
    }

    // Draw planets
    Object.values(planets).forEach(planet => {
      if (planet.visible && planet.altitude > 0) {
        const x = (planet.azimuth / 360) * width;
        const y = height - ((planet.altitude / 90) * height);
        
        const colors = {
          'Mercury': '#a0a0a0', 'Venus': '#ffd700', 'Mars': '#ff6b6b',
          'Jupiter': '#ffa500', 'Saturn': '#f4e4c1', 'Uranus': '#4fd4ff',
          'Neptune': '#4169e1', 'Moon': '#f0f0f0', 'Sun': '#ffff00'
        };
        
        const color = colors[planet.name] || '#ffffff';
        const size = planet.name === 'Sun' || planet.name === 'Moon' ? 12 : 8;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        const planetGlow = ctx.createRadialGradient(x, y, 0, x, y, 25);
        planetGlow.addColorStop(0, color + 'aa');
        planetGlow.addColorStop(1, color + '00');
        ctx.fillStyle = planetGlow;
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Space Grotesk';
        ctx.fillText(planet.name, x + 15, y + 5);
      }
    });

    // Draw FOV circle if enabled
    if (fovEnabled) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      const fovRadius = (fovSize / 90) * (height / 2);
      ctx.beginPath();
      ctx.arc(width/2, height/2, fovRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Compass directions
    ctx.fillStyle = '#788cff';
    ctx.font = 'bold 16px Space Grotesk';
    ctx.fillText('N', width / 2 - 8, 30);
    ctx.fillText('S', width / 2 - 8, height - 15);
    ctx.fillText('E', width - 30, height / 2 + 5);
    ctx.fillText('W', 15, height / 2 + 5);
  };

  const drawCoordinateGrids = (ctx, width, height) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(120, 140, 255, 0.2)';
    ctx.lineWidth = 1;
    
    // Draw horizontal grid lines
    if (showHorizontalGrid) {
      for (let alt = 0; alt <= 90; alt += 15) {
        const y = height - ((alt / 90) * height);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Draw vertical grid lines (azimuth)
      for (let az = 0; az < 360; az += 30) {
        const x = (az / 360) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  };

  const drawConstellationLines = (ctx, width, height) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.4)';
    ctx.lineWidth = 1.5;
    
    // Sample constellation lines (simplified)
    const orionLines = [
      [{az: 90, alt: 30}, {az: 95, alt: 35}],
      [{az: 95, alt: 35}, {az: 100, alt: 30}],
    ];
    
    orionLines.forEach(line => {
      ctx.beginPath();
      const x1 = (line[0].az / 360) * width;
      const y1 = height - ((line[0].alt / 90) * height);
      const x2 = (line[1].az / 360) * width;
      const y2 = height - ((line[1].alt / 90) * height);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
    
    ctx.restore();
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed) => {
    const speeds = {
      '1x': 1,
      '10x': 10,
      '60x': 60,
      '1h': 3600,
      '1d': 86400,
      '1w': 604800
    };
    setSpeedMultiplier(speeds[speed] || 1);
  };

  const resetToNow = () => {
    setCurrentTime(new Date());
    setIsPlaying(false);
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
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fff', fontFamily: 'Orbitron' }} data-testid="advanced-skymap-title">
            Advanced Stellarium View
          </h1>
        </div>

        {/* Time Machine Controls */}
        <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ color: '#fff', fontSize: '1.1rem', fontFamily: 'monospace' }}>
              {currentTime.toLocaleString()}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button onClick={handlePlayPause} data-testid="play-pause-button">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </Button>
              <Button onClick={resetToNow} variant="outline" data-testid="reset-time-button">
                <RotateCcw size={20} />
              </Button>
            </div>
            
            <Select value={`${speedMultiplier}x`} onValueChange={handleSpeedChange}>
              <SelectTrigger style={{ width: '120px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: '#1a1f3a', border: '1px solid rgba(120,140,255,0.3)' }}>
                <SelectItem value="1x">1x Real-time</SelectItem>
                <SelectItem value="10x">10x Speed</SelectItem>
                <SelectItem value="60x">60x (1 min/sec)</SelectItem>
                <SelectItem value="1h">1 hour/sec</SelectItem>
                <SelectItem value="1d">1 day/sec</SelectItem>
                <SelectItem value="1w">1 week/sec</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
          {/* Enhanced Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Tabs defaultValue="location" style={{ width: '100%' }}>
              <TabsList style={{ background: 'rgba(255,255,255,0.05)', width: '100%' }}>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="display">Display</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
              </TabsList>
              
              <TabsContent value="location">
                <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <Label style={{ color: '#b8c5ff', marginBottom: '0.5rem', display: 'block' }}>Latitude</Label>
                    <Input
                      type="number"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      step="0.0001"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <Label style={{ color: '#b8c5ff', marginBottom: '0.5rem', display: 'block' }}>Longitude</Label>
                    <Input
                      type="number"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      step="0.0001"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }}
                    />
                  </div>
                
                <Button
                  onClick={fetchSkyData}
                  disabled={loading}
                  style={{ width: '100%', marginTop: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontWeight: '600' }}
                  data-testid="update-sky-button"
                >
                  {loading ? 'Loading...' : 'Update Sky Map'}
                </Button>
                </Card>
              </TabsContent>
              
              <TabsContent value="display">
                <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Label style={{ color: '#b8c5ff' }}>Constellation Lines</Label>
                      <Switch checked={showConstellationLines} onCheckedChange={setShowConstellationLines} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Label style={{ color: '#b8c5ff' }}>Horizontal Grid</Label>
                      <Switch checked={showHorizontalGrid} onCheckedChange={setShowHorizontalGrid} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Label style={{ color: '#b8c5ff' }}>Equatorial Grid</Label>
                      <Switch checked={showEquatorialGrid} onCheckedChange={setShowEquatorialGrid} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Label style={{ color: '#b8c5ff' }}>Milky Way</Label>
                      <Switch checked={showMilkyWay} onCheckedChange={setShowMilkyWay} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Label style={{ color: '#b8c5ff' }}>Atmosphere</Label>
                      <Switch checked={showAtmosphere} onCheckedChange={setShowAtmosphere} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Label style={{ color: '#b8c5ff' }}>Satellites</Label>
                      <Switch checked={showSatellites} onCheckedChange={setShowSatellites} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Label style={{ color: '#b8c5ff' }}>Deep Sky Objects</Label>
                      <Switch checked={showDeepSky} onCheckedChange={setShowDeepSky} />
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="filters">
                <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Label style={{ color: '#b8c5ff', marginBottom: '0.5rem', display: 'block' }}>
                      Magnitude Limit: {magnitudeLimit}
                    </Label>
                    <Slider
                      value={[magnitudeLimit]}
                      onValueChange={(v) => setMagnitudeLimit(v[0])}
                      min={1}
                      max={10}
                      step={0.5}
                      style={{ marginBottom: '0.5rem' }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Label style={{ color: '#b8c5ff', marginBottom: '0.5rem', display: 'block' }}>
                      Light Pollution (Bortle): {lightPollution}
                    </Label>
                    <Slider
                      value={[lightPollution]}
                      onValueChange={(v) => setLightPollution(v[0])}
                      min={1}
                      max={9}
                      step={1}
                    />
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <Label style={{ color: '#b8c5ff' }}>FOV Circle</Label>
                      <Switch checked={fovEnabled} onCheckedChange={setFovEnabled} />
                    </div>
                    {fovEnabled && (
                      <>
                        <Label style={{ color: '#b8c5ff', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                          FOV Size: {fovSize}°
                        </Label>
                        <Slider
                          value={[fovSize]}
                          onValueChange={(v) => setFovSize(v[0])}
                          min={1}
                          max={10}
                          step={0.5}
                        />
                      </>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Visible Objects */}
            <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem' }}>
              <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Visible Objects</h4>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {Object.values(planets).filter(p => p.visible).map(planet => (
                  <div key={planet.name} style={{ padding: '0.5rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ color: '#fff', fontWeight: '600' }}>{planet.name}</div>
                    <div style={{ color: '#788cff', fontSize: '0.9rem' }}>Alt: {planet.altitude.toFixed(1)}° | Az: {planet.azimuth.toFixed(1)}°</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Advanced Sky Map Canvas */}
          <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem' }}>
            <canvas
              ref={canvasRef}
              width={1200}
              height={800}
              style={{ width: '100%', height: 'auto', borderRadius: '8px', cursor: 'crosshair' }}
              data-testid="advanced-skymap-canvas"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSkyMap;
