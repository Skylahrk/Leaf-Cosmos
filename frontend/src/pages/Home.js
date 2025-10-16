import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Telescope, Map, Calendar, Sparkles, Globe, Moon } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPOD();
    createStars();
  }, []);

  const fetchAPOD = async () => {
    try {
      const response = await axios.get(`${API}/nasa/apod`);
      setApod(response.data);
    } catch (error) {
      console.error('Error fetching APOD:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStars = () => {
    const starfield = document.querySelector('.starfield');
    if (!starfield) return;
    
    for (let i = 0; i < 200; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      starfield.appendChild(star);
    }
  };

  return (
    <div>
      <div className="starfield"></div>
      
      {/* Navbar */}
      <nav className="navbar" data-testid="navbar">
        <div className="logo" data-testid="logo">PLANETARIUM</div>
        <div className="nav-links">
          <Link to="/sky-map" className="nav-link" data-testid="nav-sky-map">Sky Map</Link>
          <Link to="/planner" className="nav-link" data-testid="nav-planner">Planner</Link>
          <Link to="/constellations" className="nav-link" data-testid="nav-constellations">Constellations</Link>
          <Link to="/3d-view" className="nav-link" data-testid="nav-3d-view">3D View</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" data-testid="hero-section">
        <h1 className="hero-title" data-testid="hero-title">Explore The Universe</h1>
        <p className="hero-subtitle" data-testid="hero-subtitle">
          Your personalized portal to the cosmos. Track planets, create custom constellations,
          and plan your stargazing adventures with real-time astronomical data.
        </p>
        <div className="cta-buttons">
          <Link to="/advanced-sky" className="btn-primary" data-testid="btn-explore-sky">Advanced Sky Map</Link>
          <Link to="/sky-map" className="btn-secondary" data-testid="btn-simple-sky">Simple Sky View</Link>
          <Link to="/planner" className="btn-secondary" data-testid="btn-plan-night">Plan Your Night</Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" data-testid="features-section">
        <h2 className="section-title" data-testid="features-title">Unique Features</h2>
        <div className="features-grid">
          <div className="feature-card" data-testid="feature-interactive-map">
            <div className="feature-icon"><Map size={48} /></div>
            <h3 className="feature-title">Interactive Star Map</h3>
            <p className="feature-description">
              View real-time positions of stars, planets, and constellations based on your location and time.
            </p>
          </div>

          <div className="feature-card" data-testid="feature-planet-tracking">
            <div className="feature-icon"><Globe size={48} /></div>
            <h3 className="feature-title">Planet Tracking</h3>
            <p className="feature-description">
              Track all planets in our solar system with accurate positioning and visibility information.
            </p>
          </div>

          <div className="feature-card" data-testid="feature-custom-constellations">
            <div className="feature-icon"><Sparkles size={48} /></div>
            <h3 className="feature-title">Custom Constellations</h3>
            <p className="feature-description">
              Create and save your own constellations by connecting stars in unique patterns.
            </p>
            <Link to="/constellations-3d" style={{ marginTop: '1rem', display: 'inline-block', color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
              View in 3D →
            </Link>
          </div>

          <div className="feature-card" data-testid="feature-stargazing-planner">
            <div className="feature-icon"><Calendar size={48} /></div>
            <h3 className="feature-title">Stargazing Planner</h3>
            <p className="feature-description">
              Schedule astronomical events and get reminders for meteor showers, eclipses, and more.
            </p>
          </div>

          <div className="feature-card" data-testid="feature-3d-view">
            <div className="feature-icon"><Telescope size={48} /></div>
            <h3 className="feature-title">3D Solar System</h3>
            <p className="feature-description">
              Experience planets with Saturn's rings, asteroid belt, temperature data, and ancient astronomy facts.
            </p>
            <Link to="/solar-system" style={{ marginTop: '1rem', display: 'inline-block', color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
              Enhanced View →
            </Link>
          </div>

          <div className="feature-card" data-testid="feature-multi-calendar">
            <div className="feature-icon"><Moon size={48} /></div>
            <h3 className="feature-title">Multi-Calendar Support</h3>
            <p className="feature-description">
              View astronomical events in Western, Chinese, Islamic, Hebrew, and other calendar systems.
            </p>
          </div>
        </div>
      </section>

      {/* NASA APOD Section */}
      {!loading && apod && (
        <section className="features" style={{ paddingTop: '2rem' }} data-testid="apod-section">
          <h2 className="section-title">Astronomy Picture of the Day</h2>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(120, 140, 255, 0.2)',
            borderRadius: '16px',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)'
          }}>
            {apod.media_type === 'image' && (
              <img 
                src={apod.url} 
                alt={apod.title}
                style={{ width: '100%', display: 'block' }}
                data-testid="apod-image"
              />
            )}
            <div style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#fff' }} data-testid="apod-title">
                {apod.title}
              </h3>
              <p style={{ color: '#b8c5ff', lineHeight: '1.6' }} data-testid="apod-description">
                {apod.explanation}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
