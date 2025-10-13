import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SkyMap = () => {
  const canvasRef = useRef(null);
  const [latitude, setLatitude] = useState(40.7128);
  const [longitude, setLongitude] = useState(-74.0060);
  const [datetime, setDatetime] = useState(new Date().toISOString().slice(0, 16));
  const [planets, setPlanets] = useState({});
  const [stars, setStars] = useState([]);
  const [constellations, setConstellations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConstellations();
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

  useEffect(() => {
    if (planets && stars) {
      drawSkyMap();
    }
  }, [planets, stars]);

  const fetchConstellations = async () => {
    try {
      const response = await axios.get(`${API}/constellations`);
      setConstellations(response.data);
    } catch (error) {
      console.error('Error fetching constellations:', error);
    }
  };

  const fetchSkyData = async () => {
    setLoading(true);
    try {
      const locationData = {
        latitude,
        longitude,
        datetime: new Date(datetime).toISOString()
      };

      const [planetsRes, starsRes] = await Promise.all([
        axios.post(`${API}/planets/positions`, locationData),
        axios.post(`${API}/stars/visible`, locationData)
      ]);

      setPlanets(planetsRes.data);
      setStars(starsRes.data);
    } catch (error) {
      console.error('Error fetching sky data:', error);
    } finally {
      setLoading(false);
    }
  };

  const drawSkyMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, width, height);

    // Draw gradient background
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    gradient.addColorStop(0, '#1a1f3a');
    gradient.addColorStop(1, '#0a0e27');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw stars
    stars.forEach(star => {
      const x = ((star.azimuth / 360) * width);
      const y = height - ((star.altitude / 90) * height);
      
      // Star size based on magnitude (brighter = larger)
      const size = Math.max(2, 6 - star.magnitude);
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      
      // Draw star glow
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw star names
      ctx.fillStyle = '#b8c5ff';
      ctx.font = '12px Space Grotesk';
      ctx.fillText(star.name, x + 10, y - 10);
    });

    // Draw planets
    Object.values(planets).forEach(planet => {
      if (planet.visible && planet.altitude > 0) {
        const x = ((planet.azimuth / 360) * width);
        const y = height - ((planet.altitude / 90) * height);
        
        // Planet colors
        const colors = {
          'Mercury': '#a0a0a0',
          'Venus': '#ffd700',
          'Mars': '#ff6b6b',
          'Jupiter': '#ffa500',
          'Saturn': '#f4e4c1',
          'Uranus': '#4fd4ff',
          'Neptune': '#4169e1',
          'Moon': '#f0f0f0',
          'Sun': '#ffff00'
        };
        
        const color = colors[planet.name] || '#ffffff';
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Planet glow
        const planetGlow = ctx.createRadialGradient(x, y, 0, x, y, 20);
        planetGlow.addColorStop(0, color + 'aa');
        planetGlow.addColorStop(1, color + '00');
        ctx.fillStyle = planetGlow;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Planet name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Space Grotesk';
        ctx.fillText(planet.name, x + 15, y + 5);
      }
    });

    // Draw compass directions
    ctx.fillStyle = '#788cff';
    ctx.font = 'bold 16px Space Grotesk';
    ctx.fillText('N', width / 2 - 8, 30);
    ctx.fillText('S', width / 2 - 8, height - 15);
    ctx.fillText('E', width - 30, height / 2 + 5);
    ctx.fillText('W', 15, height / 2 + 5);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" data-testid="back-button">
            <Button variant="outline" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.3)', color: '#e0e6ff' }}>
              <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back
            </Button>
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fff', fontFamily: 'Orbitron' }} data-testid="skymap-title">Interactive Sky Map</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
          {/* Controls */}
          <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem', height: 'fit-content' }} data-testid="controls-panel">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#fff' }}>Location & Time</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <Label style={{ color: '#b8c5ff', marginBottom: '0.5rem', display: 'block' }}>Latitude</Label>
              <Input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                step="0.0001"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }}
                data-testid="latitude-input"
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
                data-testid="longitude-input"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <Label style={{ color: '#b8c5ff', marginBottom: '0.5rem', display: 'block' }}>Date & Time</Label>
              <Input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }}
                data-testid="datetime-input"
              />
            </div>

            <Button
              onClick={fetchSkyData}
              disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontWeight: '600' }}
              data-testid="update-sky-button"
            >
              {loading ? 'Loading...' : 'Update Sky Map'}
            </Button>

            {/* Visible Objects */}
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Visible Tonight</h4>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {Object.values(planets).filter(p => p.visible).map(planet => (
                  <div key={planet.name} style={{ padding: '0.5rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }} data-testid={`planet-${planet.name.toLowerCase()}`}>
                    <div style={{ color: '#fff', fontWeight: '600' }}>{planet.name}</div>
                    <div style={{ color: '#788cff', fontSize: '0.9rem' }}>Alt: {planet.altitude.toFixed(1)}° | Az: {planet.azimuth.toFixed(1)}°</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Sky Map Canvas */}
          <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem' }} data-testid="skymap-canvas-container">
            <canvas
              ref={canvasRef}
              width={1000}
              height={700}
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
              data-testid="skymap-canvas"
            />
          </Card>
        </div>

        {/* Constellations Info */}
        <Card style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '2rem' }} data-testid="constellations-info">
          <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem' }}>Major Constellations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {constellations.map(constellation => (
              <div key={constellation.name} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }} data-testid={`constellation-${constellation.name.toLowerCase()}`}>
                <div style={{ color: '#fff', fontWeight: '600', marginBottom: '0.25rem' }}>{constellation.name}</div>
                <div style={{ color: '#788cff', fontSize: '0.9rem' }}>{constellation.common_name}</div>
                <div style={{ color: '#b8c5ff', fontSize: '0.85rem', marginTop: '0.25rem' }}>Best: {constellation.best_month}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SkyMap;
