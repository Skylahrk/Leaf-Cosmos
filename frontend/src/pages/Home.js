import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Telescope, Map, Calendar, Sparkles, Globe, Moon, Satellite, Eclipse } from 'lucide-react';

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
    <div style={{
      minHeight: '100vh',
      background: `
        linear-gradient(135deg, rgba(26, 10, 62, 0.3) 0%, rgba(45, 27, 105, 0.2) 50%, rgba(74, 44, 125, 0.1) 100%),
        url('https://customer-assets.emergentagent.com/job_leaf-cosmos/artifacts/u6eey454_img-cosmos.jpg')
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
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
      <section className="features" style={{ paddingTop: '2rem' }} data-testid="apod-section">
        <h2 className="section-title" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <span style={{ fontSize: '2rem' }}>🌠</span>
          Astronomy Picture of the Day
          <span style={{ fontSize: '2rem' }}>🌠</span>
        </h2>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p style={{ color: '#b8c5ff', marginTop: '1rem' }}>Loading today's cosmic wonder...</p>
          </div>
        ) : apod ? (
          <div style={{
            maxWidth: '1100px',
            margin: '0 auto',
            background: 'rgba(20, 10, 50, 0.8)',
            border: '2px solid rgba(180, 160, 255, 0.4)',
            borderRadius: '20px',
            overflow: 'hidden',
            backdropFilter: 'blur(15px)',
            boxShadow: '0 20px 60px rgba(147, 112, 219, 0.3)'
          }}>
            {apod.media_type === 'image' ? (
              <div style={{ 
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
                overflow: 'hidden',
                background: '#000'
              }}>
                <img 
                  src={apod.url} 
                  alt={apod.title}
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  data-testid="apod-image"
                />
              </div>
            ) : apod.media_type === 'video' ? (
              <div style={{ 
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
                overflow: 'hidden',
                background: '#000'
              }}>
                <iframe
                  src={apod.url}
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  title={apod.title}
                  allowFullScreen
                  data-testid="apod-video"
                />
              </div>
            ) : null}
            
            <div style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ 
                  fontSize: '2rem', 
                  marginBottom: '0.5rem', 
                  color: '#fff',
                  fontWeight: '700',
                  flex: 1,
                  minWidth: '250px'
                }} data-testid="apod-title">
                  {apod.title}
                </h3>
                <div style={{
                  background: 'rgba(147, 112, 219, 0.2)',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '25px',
                  border: '1px solid rgba(147, 112, 219, 0.4)'
                }}>
                  <div style={{ color: '#DDA0DD', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Date</div>
                  <div style={{ color: '#fff', fontWeight: '600' }}>{apod.date}</div>
                </div>
              </div>
              
              {apod.copyright && (
                <div style={{ 
                  marginBottom: '1rem',
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  borderLeft: '3px solid #9370DB'
                }}>
                  <span style={{ color: '#DDA0DD', fontSize: '0.9rem', fontWeight: '600' }}>Copyright: </span>
                  <span style={{ color: '#E6E6FA', fontSize: '0.9rem' }}>{apod.copyright}</span>
                </div>
              )}
              
              <p style={{ 
                color: '#b8c5ff', 
                lineHeight: '1.8',
                fontSize: '1.05rem',
                textAlign: 'justify'
              }} data-testid="apod-description">
                {apod.explanation}
              </p>
              
              {apod.hdurl && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <a 
                    href={apod.hdurl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '1rem 2.5rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '1.05rem',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.6)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    🔭 View in HD Quality
                  </a>
                </div>
              )}
              
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'rgba(147, 112, 219, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(147, 112, 219, 0.3)'
              }}>
                <div style={{ color: '#DDA0DD', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  About NASA APOD
                </div>
                <div style={{ color: '#E6E6FA', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  Each day, NASA features a different image or photograph of our fascinating universe, 
                  along with a brief explanation written by a professional astronomer. Discover the cosmos!
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '3rem',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(120, 140, 255, 0.2)',
            borderRadius: '16px'
          }}>
            <p style={{ color: '#b8c5ff', fontSize: '1.1rem' }}>
              Unable to load today's astronomy picture. Please check back later!
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
