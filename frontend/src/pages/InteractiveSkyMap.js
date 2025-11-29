import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Clock, Info, X, Star, Telescope } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InteractiveSkyMap = () => {
  const canvasRef = useRef(null);
  const [latitude, setLatitude] = useState(40.7128);
  const [longitude, setLongitude] = useState(-74.0060);
  const [datetime, setDatetime] = useState(new Date().toISOString().slice(0, 16));
  const [planets, setPlanets] = useState({});
  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
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
    if (planets && stars.length > 0) {
      drawSkyMap();
    }
  }, [planets, stars, hoveredObject]);

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

  const getStarColor = (magnitude) => {
    // Realistic star colors based on magnitude/temperature
    if (magnitude < 0) return '#aad7ff'; // Very bright, blue-white
    if (magnitude < 1) return '#cce0ff'; // Bright, white-blue
    if (magnitude < 2) return '#ffffff'; // White
    if (magnitude < 3) return '#fff4e8'; // Yellow-white
    if (magnitude < 4) return '#ffd7a8'; // Orange
    return '#ffccaa'; // Red-orange, dimmer
  };

  const getStarSize = (magnitude) => {
    // Realistic star sizes as they appear to naked eye
    if (magnitude < 0) return 6; // Very bright (Sirius, etc.)
    if (magnitude < 1) return 5;
    if (magnitude < 2) return 4;
    if (magnitude < 3) return 3;
    if (magnitude < 4) return 2.5;
    if (magnitude < 5) return 2;
    return 1.5; // Barely visible
  };

  const drawSkyMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas with deep space background
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    gradient.addColorStop(0, '#0a1128');
    gradient.addColorStop(0.5, '#050820');
    gradient.addColorStop(1, '#000510');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add some background dim stars for realism
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.beginPath();
      ctx.arc(x, y, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw cardinal directions
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('N', width / 2, 30);
    ctx.fillText('S', width / 2, height - 15);
    ctx.fillText('E', width - 30, height / 2);
    ctx.fillText('W', 30, height / 2);

    // Draw horizon line
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw stars with realistic appearance
    stars.forEach(star => {
      const x = ((star.azimuth / 360) * width);
      const y = height - ((star.altitude / 90) * height);
      
      if (star.altitude < 0) return; // Don't draw stars below horizon
      
      const size = getStarSize(star.magnitude);
      const color = getStarColor(star.magnitude);
      const isHovered = hoveredObject?.type === 'star' && hoveredObject?.data.name === star.name;
      
      // Draw star with realistic twinkling effect
      ctx.save();
      
      // Star glow for brighter stars
      if (star.magnitude < 2) {
        const glowSize = size * 4;
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        glowGradient.addColorStop(0, color + 'aa');
        glowGradient.addColorStop(0.5, color + '33');
        glowGradient.addColorStop(1, color + '00');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw the star
      ctx.fillStyle = color;
      ctx.shadowBlur = isHovered ? 15 : (star.magnitude < 1 ? 8 : 0);
      ctx.shadowColor = color;
      
      // Star shape with slight cross effect for brighter stars
      if (star.magnitude < 1.5) {
        // Draw cross rays
        ctx.strokeStyle = color;
        ctx.lineWidth = size / 3;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(x - size * 2, y);
        ctx.lineTo(x + size * 2, y);
        ctx.moveTo(x, y - size * 2);
        ctx.lineTo(x, y + size * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      
      // Main star point
      ctx.beginPath();
      ctx.arc(x, y, isHovered ? size * 1.5 : size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      // Draw star name for bright stars or hovered
      if (star.magnitude < 1.5 || isHovered) {
        ctx.fillStyle = isHovered ? '#ffffff' : '#b8c5ff';
        ctx.font = isHovered ? 'bold 13px Arial' : '11px Arial';
        ctx.textAlign = 'left';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#000';
        ctx.fillText(star.name, x + 8, y - 8);
        ctx.shadowBlur = 0;
      }
      
      // Store position for click detection
      star._x = x;
      star._y = y;
      star._size = size;
    });

    // Draw planets with enhanced appearance
    Object.values(planets).forEach(planet => {
      if (planet.visible && planet.altitude > 0) {
        const x = ((planet.azimuth / 360) * width);
        const y = height - ((planet.altitude / 90) * height);
        
        const colors = {
          'Mercury': '#b8b8b8',
          'Venus': '#ffd700',
          'Mars': '#ff6b4a',
          'Jupiter': '#f4a261',
          'Saturn': '#e9c46a',
          'Uranus': '#4ecdc4',
          'Neptune': '#4a90e2',
          'Moon': '#f0f0f0',
          'Sun': '#ffeb3b'
        };
        
        const color = colors[planet.name] || '#ffffff';
        const isHovered = hoveredObject?.type === 'planet' && hoveredObject?.data.name === planet.name;
        
        ctx.save();
        
        // Planet glow
        const glowSize = 25;
        const planetGlow = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        planetGlow.addColorStop(0, color + 'cc');
        planetGlow.addColorStop(0.5, color + '44');
        planetGlow.addColorStop(1, color + '00');
        ctx.fillStyle = planetGlow;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Planet body
        ctx.fillStyle = color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(x, y, isHovered ? 10 : 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Planet name
        ctx.fillStyle = '#ffffff';
        ctx.font = isHovered ? 'bold 14px Arial' : 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#000';
        ctx.fillText(planet.name, x, y - 20);
        ctx.shadowBlur = 0;
        
        // Store position
        planet._x = x;
        planet._y = y;
        planet._size = 8;
      }
    });
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    console.log('Click at:', x, y);
    
    // Check if clicked on a planet (check planets first as they're larger)
    for (const planet of Object.values(planets)) {
      if (planet._x && planet._y && planet.visible) {
        const distance = Math.sqrt(Math.pow(x - planet._x, 2) + Math.pow(y - planet._y, 2));
        console.log(`Planet ${planet.name} at (${planet._x}, ${planet._y}), distance: ${distance}`);
        if (distance < 60) { // Large hit area for easy clicking
          console.log(`Selected planet: ${planet.name}`);
          setSelectedObject({
            type: 'planet',
            data: planet
          });
          return;
        }
      }
    }
    
    // Check if clicked on a star
    for (const star of stars) {
      if (star._x && star._y && star.altitude > 0) {
        const distance = Math.sqrt(Math.pow(x - star._x, 2) + Math.pow(y - star._y, 2));
        if (distance < (star._size || 3) + 10) { // Increased hit area
          console.log(`Selected star: ${star.name}`);
          setSelectedObject({
            type: 'star',
            data: star
          });
          return;
        }
      }
    }
    
    console.log('No object selected');
    setSelectedObject(null);
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setMousePos({ x: e.clientX, y: e.clientY });
    
    let foundHover = null;
    
    // Check hover on planets first (larger targets)
    for (const planet of Object.values(planets)) {
      if (planet._x && planet._y && planet.visible) {
        const distance = Math.sqrt(Math.pow(x - planet._x, 2) + Math.pow(y - planet._y, 2));
        if (distance < 60) { // Large hover area for easy interaction
          foundHover = { type: 'planet', data: planet };
          canvas.style.cursor = 'pointer';
          break;
        }
      }
    }
    
    // Check hover on stars
    if (!foundHover) {
      for (const star of stars) {
        if (star._x && star._y && star.altitude > 0) {
          const distance = Math.sqrt(Math.pow(x - star._x, 2) + Math.pow(y - star._y, 2));
          if (distance < (star._size || 3) + 10) {
            foundHover = { type: 'star', data: star };
            canvas.style.cursor = 'pointer';
            break;
          }
        }
      }
    }
    
    if (!foundHover) {
      canvas.style.cursor = 'default';
    }
    
    setHoveredObject(foundHover);
  };

  const getStarInfo = (star) => {
    const spectralClasses = {
      'O': { temp: '30,000+ K', color: 'Blue', description: 'Extremely hot and luminous' },
      'B': { temp: '10,000-30,000 K', color: 'Blue-white', description: 'Very hot and bright' },
      'A': { temp: '7,500-10,000 K', color: 'White', description: 'Hot and bright' },
      'F': { temp: '6,000-7,500 K', color: 'Yellow-white', description: 'Medium temperature' },
      'G': { temp: '5,200-6,000 K', color: 'Yellow', description: 'Sun-like stars' },
      'K': { temp: '3,700-5,200 K', color: 'Orange', description: 'Cooler than Sun' },
      'M': { temp: '2,400-3,700 K', color: 'Red', description: 'Cool and dim' }
    };
    
    // Estimate spectral class from magnitude and color
    const mag = star.magnitude;
    let spectralClass = 'A';
    if (mag < -1) spectralClass = 'B';
    else if (mag < 0.5) spectralClass = 'A';
    else if (mag < 2) spectralClass = 'F';
    else if (mag < 3) spectralClass = 'G';
    else if (mag < 4) spectralClass = 'K';
    else spectralClass = 'M';
    
    return spectralClasses[spectralClass] || spectralClasses['G'];
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #000510, #0a1128)',
      padding: '2rem',
      color: '#fff'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" style={{ color: '#667eea', textDecoration: 'none' }}>
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
                Interactive Sky Map
              </h1>
              <p style={{ fontSize: '1rem', color: '#b8c5ff', marginTop: '0.5rem' }}>
                Click on stars and planets to learn more • Realistic view as seen by naked eye
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          background: 'rgba(20, 10, 50, 0.8)',
          border: '2px solid rgba(102, 126, 234, 0.4)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b8c5ff' }}>
              <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Latitude
            </label>
            <input
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b8c5ff' }}>
              <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Longitude
            </label>
            <input
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b8c5ff' }}>
              <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={fetchSkyData}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.5rem 1.5rem',
                background: loading ? '#555' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Telescope size={20} />
              {loading ? 'Loading...' : 'View Sky'}
            </button>
          </div>
        </div>

        {/* Sky Map Canvas */}
        <div style={{
          background: 'rgba(20, 10, 50, 0.8)',
          border: '2px solid rgba(102, 126, 234, 0.4)',
          borderRadius: '16px',
          padding: '1rem',
          backdropFilter: 'blur(10px)',
          position: 'relative'
        }}>
          <canvas
            ref={canvasRef}
            width={1500}
            height={800}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '12px',
              background: '#000'
            }}
          />
          
          {/* Hover tooltip */}
          {hoveredObject && (
            <div style={{
              position: 'fixed',
              left: mousePos.x + 15,
              top: mousePos.y + 15,
              background: 'rgba(0, 0, 0, 0.95)',
              border: '2px solid #667eea',
              borderRadius: '8px',
              padding: '0.75rem',
              pointerEvents: 'none',
              zIndex: 1000,
              maxWidth: '250px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {hoveredObject.data.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#b8c5ff' }}>
                {hoveredObject.type === 'star' ? (
                  <>Magnitude: {hoveredObject.data.magnitude.toFixed(2)}</>
                ) : (
                  <>Altitude: {hoveredObject.data.altitude.toFixed(1)}°</>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                Click for details
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        {selectedObject && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(10, 5, 30, 0.98)',
            border: '3px solid #667eea',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            zIndex: 2000,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
          }}>
            <button
              onClick={() => setSelectedObject(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff'
              }}
            >
              <X size={20} />
            </button>

            {selectedObject.type === 'star' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <Star size={32} color="#ffd700" />
                  <div>
                    <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{selectedObject.data.name}</h2>
                    <p style={{ color: '#b8c5ff', margin: '0.25rem 0 0 0' }}>Star</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.3)'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#b8c5ff', marginBottom: '0.5rem' }}>
                      Apparent Magnitude
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '600' }}>
                      {selectedObject.data.magnitude.toFixed(2)}
                      <span style={{ fontSize: '0.9rem', color: '#b8c5ff', marginLeft: '0.5rem' }}>
                        ({selectedObject.data.magnitude < 1.5 ? 'Very Bright' : 
                          selectedObject.data.magnitude < 3 ? 'Bright' : 'Visible'})
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{
                      padding: '1rem',
                      background: 'rgba(102, 126, 234, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(102, 126, 234, 0.3)'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#b8c5ff', marginBottom: '0.5rem' }}>
                        Altitude
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                        {selectedObject.data.altitude.toFixed(1)}°
                      </div>
                    </div>

                    <div style={{
                      padding: '1rem',
                      background: 'rgba(102, 126, 234, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(102, 126, 234, 0.3)'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#b8c5ff', marginBottom: '0.5rem' }}>
                        Azimuth
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                        {selectedObject.data.azimuth.toFixed(1)}°
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const info = getStarInfo(selectedObject.data);
                    return (
                      <div style={{
                        padding: '1rem',
                        background: 'rgba(102, 126, 234, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.3)'
                      }}>
                        <div style={{ fontSize: '0.85rem', color: '#b8c5ff', marginBottom: '0.5rem' }}>
                          Estimated Properties
                        </div>
                        <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                          <div><strong>Color:</strong> {info.color}</div>
                          <div><strong>Temperature:</strong> {info.temp}</div>
                          <div><strong>Type:</strong> {info.description}</div>
                        </div>
                      </div>
                    );
                  })()}

                  <div style={{
                    padding: '1rem',
                    background: 'rgba(255, 193, 7, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 193, 7, 0.3)',
                    fontSize: '0.9rem',
                    color: '#ffc107'
                  }}>
                    💡 <strong>Did you know?</strong> The magnitude scale is logarithmic - each step of 1 magnitude 
                    represents a brightness difference of about 2.5 times!
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: selectedObject.data.name === 'Sun' ? '#ffeb3b' :
                               selectedObject.data.name === 'Moon' ? '#f0f0f0' :
                               selectedObject.data.name === 'Venus' ? '#ffd700' :
                               selectedObject.data.name === 'Mars' ? '#ff6b4a' : '#4a90e2'
                  }} />
                  <div>
                    <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{selectedObject.data.name}</h2>
                    <p style={{ color: '#b8c5ff', margin: '0.25rem 0 0 0' }}>Planet</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{
                      padding: '1rem',
                      background: 'rgba(102, 126, 234, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(102, 126, 234, 0.3)'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#b8c5ff', marginBottom: '0.5rem' }}>
                        Altitude
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                        {selectedObject.data.altitude.toFixed(1)}°
                      </div>
                    </div>

                    <div style={{
                      padding: '1rem',
                      background: 'rgba(102, 126, 234, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(102, 126, 234, 0.3)'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#b8c5ff', marginBottom: '0.5rem' }}>
                        Azimuth
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                        {selectedObject.data.azimuth.toFixed(1)}°
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#10b981' }}>
                      ✅ Currently Visible
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#b8c5ff', marginTop: '0.5rem' }}>
                      Look in the sky at the position shown above
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveSkyMap;
