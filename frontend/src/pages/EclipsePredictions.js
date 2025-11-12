import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Moon, Sun, Calendar, Clock, MapPin, Loader } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EclipsePredictions = () => {
  const [lunarEclipses, setLunarEclipses] = useState([]);
  const [solarEclipses, setSolarEclipses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lunar');
  const [userLocation, setUserLocation] = useState({ latitude: 40.7128, longitude: -74.0060 });
  const [nextEclipse, setNextEclipse] = useState(null);

  useEffect(() => {
    getUserLocation();
    loadEclipses();
  }, []);

  useEffect(() => {
    findNextEclipse();
  }, [lunarEclipses, solarEclipses]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Using default location (New York)');
        }
      );
    }
  };

  const loadEclipses = async () => {
    setLoading(true);
    try {
      // Load lunar eclipses
      const lunarResponse = await axios.get(`${API}/eclipses/lunar`);
      setLunarEclipses(lunarResponse.data.eclipses || []);

      // Load solar eclipses
      const solarResponse = await axios.post(`${API}/eclipses/solar`, {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        datetime: new Date().toISOString()
      });
      setSolarEclipses(solarResponse.data.eclipses || []);
    } catch (error) {
      console.error('Error loading eclipses:', error);
    } finally {
      setLoading(false);
    }
  };

  const findNextEclipse = () => {
    const now = new Date();
    const allEclipses = [
      ...lunarEclipses.map(e => ({ ...e, eclipseType: 'Lunar' })),
      ...solarEclipses.map(e => ({ ...e, eclipseType: 'Solar' }))
    ].filter(e => new Date(e.datetime) > now)
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    if (allEclipses.length > 0) {
      setNextEclipse(allEclipses[0]);
    }
  };

  const getTimeUntilEclipse = (eclipseDateTime) => {
    const now = new Date();
    const eclipse = new Date(eclipseDateTime);
    const diff = eclipse - now;

    if (diff < 0) return 'Past';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getEclipseIcon = (type) => {
    if (type.includes('Lunar')) {
      return <Moon size={32} color="#f59e0b" />;
    }
    return <Sun size={32} color="#fbbf24" />;
  };

  const getEclipseGradient = (type) => {
    if (type.includes('Lunar')) {
      return 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)';
    }
    return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
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
      padding: '2rem',
      color: '#fff'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Moon size={48} color="#f59e0b" />
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>Eclipse Predictions</h1>
            <Sun size={48} color="#fbbf24" />
          </div>
          <p style={{ fontSize: '1.2rem', color: '#b8c5ff' }}>
            Global solar and lunar eclipse events through 2027
          </p>
        </div>

        {/* Next Eclipse Countdown */}
        {nextEclipse && (
          <div style={{
            background: getEclipseGradient(nextEclipse.eclipseType),
            borderRadius: '24px',
            padding: '2.5rem',
            marginBottom: '3rem',
            boxShadow: '0 20px 60px rgba(245, 158, 11, 0.4)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', opacity: 0.9 }}>
              NEXT ECLIPSE
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {nextEclipse.type} {nextEclipse.eclipseType} Eclipse
            </div>
            <div style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              {formatDate(nextEclipse.datetime)}
            </div>
            <div style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}>
              ⏰ {getTimeUntilEclipse(nextEclipse.datetime)}
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setActiveTab('lunar')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'lunar'
                ? 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              border: activeTab === 'lunar'
                ? '2px solid #f59e0b'
                : '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <Moon size={24} />
            Lunar Eclipses ({lunarEclipses.length})
          </button>
          
          <button
            onClick={() => setActiveTab('solar')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'solar'
                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              border: activeTab === 'solar'
                ? '2px solid #fbbf24'
                : '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <Sun size={24} />
            Solar Eclipses ({solarEclipses.length})
          </button>
        </div>

        {/* Eclipse List */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            background: 'rgba(20, 10, 50, 0.8)',
            borderRadius: '20px',
            backdropFilter: 'blur(15px)'
          }}>
            <Loader className="animate-spin" size={64} style={{ margin: '0 auto', color: '#667eea' }} />
            <p style={{ marginTop: '1.5rem', fontSize: '1.2rem', color: '#b8c5ff' }}>
              Calculating eclipse predictions...
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {(activeTab === 'lunar' ? lunarEclipses : solarEclipses).map((eclipse, index) => {
              const isPast = new Date(eclipse.datetime) < new Date();
              
              return (
                <div
                  key={index}
                  style={{
                    background: 'rgba(20, 10, 50, 0.8)',
                    border: '2px solid rgba(180, 160, 255, 0.4)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    backdropFilter: 'blur(15px)',
                    opacity: isPast ? 0.6 : 1,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(245, 158, 11, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    {getEclipseIcon(activeTab)}
                    <div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fff' }}>
                        {eclipse.type}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#b8c5ff' }}>
                        {activeTab === 'lunar' ? 'Lunar Eclipse' : 'Solar Eclipse'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Calendar size={18} color="#b8c5ff" />
                      <span style={{ color: '#b8c5ff', fontSize: '0.9rem' }}>Date</span>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                      {formatDate(eclipse.datetime)}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Clock size={18} color="#b8c5ff" />
                      <span style={{ color: '#b8c5ff', fontSize: '0.9rem' }}>Time (UTC)</span>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                      {formatTime(eclipse.datetime)}
                    </div>
                  </div>

                  {!isPast && (
                    <div style={{
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
                      borderRadius: '12px',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: '1.1rem'
                    }}>
                      🕐 In {getTimeUntilEclipse(eclipse.datetime)}
                    </div>
                  )}

                  {isPast && (
                    <div style={{
                      padding: '0.75rem',
                      background: 'rgba(100, 100, 100, 0.3)',
                      borderRadius: '12px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#999'
                    }}>
                      Past Event
                    </div>
                  )}

                  {eclipse.note && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: '#b8c5ff',
                      borderLeft: '3px solid #f59e0b'
                    }}>
                      ℹ️ {eclipse.note}
                    </div>
                  )}

                  {eclipse.description && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      color: '#b8c5ff',
                      fontStyle: 'italic'
                    }}>
                      {eclipse.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: 'rgba(20, 10, 50, 0.8)',
          border: '2px solid rgba(180, 160, 255, 0.4)',
          borderRadius: '20px',
          backdropFilter: 'blur(15px)'
        }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={24} />
            About Eclipse Visibility
          </h3>
          <div style={{ color: '#b8c5ff', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#fff' }}>Lunar Eclipses</strong> are visible from anywhere on the night side of Earth 
              and can be observed with the naked eye. They occur when Earth passes between the Sun and Moon.
            </p>
            <p>
              <strong style={{ color: '#fff' }}>Solar Eclipses</strong> are only visible from specific locations on Earth 
              along a narrow path. The times shown are approximate. Check local eclipse maps and resources for exact 
              visibility from your location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EclipsePredictions;
