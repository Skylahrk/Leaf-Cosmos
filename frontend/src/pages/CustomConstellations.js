import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CustomConstellations = () => {
  const canvasRef = useRef(null);
  const [userId] = useState('user-' + Math.random().toString(36).substr(2, 9));
  const [constellations, setConstellations] = useState([]);
  const [currentConstellation, setCurrentConstellation] = useState({
    name: '',
    stars: [],
    lines: []
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedStars, setSelectedStars] = useState([]);

  useEffect(() => {
    fetchConstellations();
    drawCanvas();
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [currentConstellation]);

  const fetchConstellations = async () => {
    try {
      const response = await axios.get(`${API}/constellations/custom/${userId}`);
      setConstellations(response.data);
    } catch (error) {
      console.error('Error fetching constellations:', error);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear and draw background
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, width, height);

    // Draw gradient
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    gradient.addColorStop(0, '#1a1f3a');
    gradient.addColorStop(1, '#0a0e27');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw existing stars
    currentConstellation.stars.forEach((star, index) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = selectedStars.includes(index) ? '#ffd700' : '#ffffff';
      ctx.fill();

      // Star glow
      const glowGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 15);
      glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Star name
      if (star.name) {
        ctx.fillStyle = '#b8c5ff';
        ctx.font = '12px Space Grotesk';
        ctx.fillText(star.name, star.x + 10, star.y - 10);
      }
    });

    // Draw lines between connected stars
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    currentConstellation.lines.forEach(line => {
      const star1 = currentConstellation.stars[line[0]];
      const star2 = currentConstellation.stars[line[1]];
      if (star1 && star2) {
        ctx.beginPath();
        ctx.moveTo(star1.x, star1.y);
        ctx.lineTo(star2.x, star2.y);
        ctx.stroke();
      }
    });
  };

  const handleCanvasClick = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Check if clicking near existing star
    const clickedStarIndex = currentConstellation.stars.findIndex(
      star => Math.sqrt(Math.pow(star.x - x, 2) + Math.pow(star.y - y, 2)) < 15
    );

    if (clickedStarIndex !== -1) {
      // Clicking existing star - toggle selection for connecting
      if (selectedStars.includes(clickedStarIndex)) {
        setSelectedStars(selectedStars.filter(i => i !== clickedStarIndex));
      } else {
        const newSelected = [...selectedStars, clickedStarIndex];
        setSelectedStars(newSelected);

        // If two stars selected, create a line
        if (newSelected.length === 2) {
          setCurrentConstellation({
            ...currentConstellation,
            lines: [...currentConstellation.lines, newSelected]
          });
          setSelectedStars([]);
        }
      }
    } else {
      // Add new star
      const newStar = {
        x,
        y,
        name: `Star ${currentConstellation.stars.length + 1}`,
        ra: 0,
        dec: 0
      };
      setCurrentConstellation({
        ...currentConstellation,
        stars: [...currentConstellation.stars, newStar]
      });
    }
  };

  const handleSaveConstellation = async () => {
    if (!currentConstellation.name) {
      toast.error('Please enter a constellation name');
      return;
    }

    if (currentConstellation.stars.length < 2) {
      toast.error('Please add at least 2 stars');
      return;
    }

    try {
      const data = {
        ...currentConstellation,
        user_id: userId
      };
      await axios.post(`${API}/constellations/custom`, data);
      toast.success('Constellation saved!');
      fetchConstellations();
      
      // Reset
      setCurrentConstellation({ name: '', stars: [], lines: [] });
      setIsDrawing(false);
      setSelectedStars([]);
    } catch (error) {
      console.error('Error saving constellation:', error);
      toast.error('Failed to save constellation');
    }
  };

  const handleDeleteConstellation = async (id) => {
    try {
      await axios.delete(`${API}/constellations/custom/${id}`);
      toast.success('Constellation deleted');
      fetchConstellations();
    } catch (error) {
      console.error('Error deleting constellation:', error);
      toast.error('Failed to delete constellation');
    }
  };

  const handleLoadConstellation = (constellation) => {
    setCurrentConstellation(constellation);
    setIsDrawing(false);
    setSelectedStars([]);
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
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fff', fontFamily: 'Orbitron' }} data-testid="custom-constellations-title">Custom Constellations</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
          {/* Controls */}
          <div>
            <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem', marginBottom: '1rem' }} data-testid="constellation-controls">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#fff' }}>Create Constellation</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <Label style={{ color: '#b8c5ff', marginBottom: '0.5rem', display: 'block' }}>Name</Label>
                <Input
                  value={currentConstellation.name}
                  onChange={(e) => setCurrentConstellation({...currentConstellation, name: e.target.value})}
                  placeholder="My Constellation"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }}
                  data-testid="constellation-name-input"
                />
              </div>

              <Button
                onClick={() => setIsDrawing(!isDrawing)}
                style={{ 
                  width: '100%', 
                  marginBottom: '1rem',
                  background: isDrawing ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.1)',
                  color: '#fff'
                }}
                data-testid="toggle-drawing-button"
              >
                {isDrawing ? 'Drawing Mode ON' : 'Start Drawing'}
              </Button>

              {isDrawing && (
                <div style={{ padding: '1rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px', marginBottom: '1rem' }}>
                  <p style={{ color: '#b8c5ff', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Click to add stars. Click two stars to connect them with a line.
                  </p>
                </div>
              )}

              <Button
                onClick={handleSaveConstellation}
                disabled={!currentConstellation.name || currentConstellation.stars.length < 2}
                style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}
                data-testid="save-constellation-button"
              >
                <Save size={18} style={{ marginRight: '0.5rem' }} /> Save Constellation
              </Button>

              <div style={{ marginTop: '1rem' }}>
                <p style={{ color: '#788cff', fontSize: '0.9rem' }}>Stars: {currentConstellation.stars.length}</p>
                <p style={{ color: '#788cff', fontSize: '0.9rem' }}>Connections: {currentConstellation.lines.length}</p>
              </div>
            </Card>

            {/* Saved Constellations */}
            <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem' }} data-testid="saved-constellations">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Saved Constellations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                {constellations.length === 0 ? (
                  <p style={{ color: '#788cff', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No saved constellations yet</p>
                ) : (
                  constellations.map(constellation => (
                    <div 
                      key={constellation.id} 
                      style={{ 
                        padding: '0.75rem', 
                        background: 'rgba(255,255,255,0.03)', 
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      data-testid={`saved-constellation-${constellation.id}`}
                    >
                      <div 
                        onClick={() => handleLoadConstellation(constellation)}
                        style={{ flex: 1, cursor: 'pointer' }}
                      >
                        <div style={{ color: '#fff', fontWeight: '600' }}>{constellation.name}</div>
                        <div style={{ color: '#788cff', fontSize: '0.85rem' }}>
                          {constellation.stars.length} stars, {constellation.lines.length} lines
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteConstellation(constellation.id)}
                        style={{ color: '#ff6b6b' }}
                        data-testid={`delete-constellation-${constellation.id}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Canvas */}
          <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem' }} data-testid="constellation-canvas-container">
            <canvas
              ref={canvasRef}
              width={1000}
              height={700}
              onClick={handleCanvasClick}
              style={{ 
                width: '100%', 
                height: 'auto', 
                borderRadius: '8px',
                cursor: isDrawing ? 'crosshair' : 'default'
              }}
              data-testid="constellation-canvas"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomConstellations;
