import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Satellite, MapPin, Clock, Eye, RefreshCw, Loader } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SatelliteTracker = () => {
  const [satelliteGroups, setSatelliteGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('stations');
  const [satellites, setSatellites] = useState([]);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [satellitePosition, setSatellitePosition] = useState(null);
  const [satellitePasses, setSatellitePasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [userLocation, setUserLocation] = useState({ latitude: 40.7128, longitude: -74.0060 });

  useEffect(() => {
    loadSatelliteGroups();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadSatellites(selectedGroup);
    }
  }, [selectedGroup]);

  useEffect(() => {
    let interval;
    if (autoRefresh && selectedSatellite) {
      interval = setInterval(() => {
        updateSatellitePosition();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, selectedSatellite]);

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

  const loadSatelliteGroups = async () => {
    try {
      const response = await axios.get(`${API}/satellites/list`);
      setSatelliteGroups(response.data);
    } catch (error) {
      console.error('Error loading satellite groups:', error);
    }
  };

  const loadSatellites = async (groupId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/satellites/tle/${groupId}`);
      setSatellites(response.data.satellites);
      if (response.data.satellites.length > 0) {
        selectSatellite(response.data.satellites[0]);
      }
    } catch (error) {
      console.error('Error loading satellites:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectSatellite = async (satellite) => {
    setSelectedSatellite(satellite);
    await updateSatellitePosition(satellite);
    await loadSatellitePasses(satellite);
  };

  const updateSatellitePosition = async (sat = selectedSatellite) => {
    if (!sat) return;
    
    try {
      const response = await axios.post(`${API}/satellites/position`, {
        name: sat.name,
        line1: sat.line1,
        line2: sat.line2,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        datetime: new Date().toISOString()
      });
      setSatellitePosition(response.data);
    } catch (error) {
      console.error('Error updating satellite position:', error);
    }
  };

  const loadSatellitePasses = async (sat) => {
    try {
      const response = await axios.post(`${API}/satellites/passes`, {
        name: sat.name,
        line1: sat.line1,
        line2: sat.line2,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        datetime: new Date().toISOString(),
        days: 7
      });
      setSatellitePasses(response.data.passes || []);
    } catch (error) {
      console.error('Error loading satellite passes:', error);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
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
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Satellite size={48} color="#667eea" />
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>Satellite Tracker</h1>
          </div>
          <p style={{ fontSize: '1.2rem', color: '#b8c5ff' }}>
            Track ISS, Starlink, GPS satellites and more in real-time
          </p>
        </div>

        {/* Info Banner */}
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>ℹ️</div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#60a5fa', marginBottom: '0.5rem' }}>
                Why Most Satellites Show "Below Horizon"
              </div>
              <div style={{ fontSize: '0.95rem', color: '#b8c5ff', lineHeight: '1.6' }}>
                <strong>This is completely normal!</strong> At any given moment, most satellites orbit on the other side of Earth from your location. 
                A satellite is only visible when it passes overhead (above your horizon). Use the <strong>"Upcoming Passes"</strong> section 
                below to see exactly when each satellite will be visible from your location over the next 7 days.
              </div>
            </div>
          </div>
        </div>

        {/* Satellite Group Selection */}
        <div style={{
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {satelliteGroups.map(group => (
            <button
              key={group.group_id}
              onClick={() => setSelectedGroup(group.group_id)}
              style={{
                padding: '0.75rem 1.5rem',
                background: selectedGroup === group.group_id 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: selectedGroup === group.group_id 
                  ? '2px solid #667eea'
                  : '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              {group.group_name}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Left Panel - Satellite List */}
          <div style={{
            background: 'rgba(20, 10, 50, 0.8)',
            border: '2px solid rgba(180, 160, 255, 0.4)',
            borderRadius: '20px',
            padding: '2rem',
            backdropFilter: 'blur(15px)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Satellite size={24} />
              Available Satellites
            </h2>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Loader className="animate-spin" size={48} style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '1rem', color: '#b8c5ff' }}>Loading satellites...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {satellites.map((sat, index) => (
                  <div
                    key={index}
                    onClick={() => selectSatellite(sat)}
                    style={{
                      padding: '1rem',
                      background: selectedSatellite?.name === sat.name
                        ? 'rgba(102, 126, 234, 0.3)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: selectedSatellite?.name === sat.name
                        ? '2px solid #667eea'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#fff' }}>{sat.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#b8c5ff', marginTop: '0.25rem' }}>
                      Click to track
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Satellite Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Current Position */}
            {selectedSatellite && satellitePosition && (
              <>
              <div style={{
                background: 'rgba(20, 10, 50, 0.8)',
                border: '2px solid rgba(180, 160, 255, 0.4)',
                borderRadius: '20px',
                padding: '2rem',
                backdropFilter: 'blur(15px)',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{selectedSatellite.name}</h2>
                  <button
                    onClick={() => {
                      setAutoRefresh(!autoRefresh);
                      if (!autoRefresh) updateSatellitePosition();
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      background: autoRefresh ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
                    {autoRefresh ? 'Live' : 'Start Live'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.3)'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#b8c5ff', marginBottom: '0.5rem' }}>
                      <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Latitude
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                      {satellitePosition.latitude.toFixed(4)}°
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.3)'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#b8c5ff', marginBottom: '0.5rem' }}>
                      <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Longitude
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                      {satellitePosition.longitude.toFixed(4)}°
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.3)'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#b8c5ff', marginBottom: '0.5rem' }}>
                      Altitude
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                      {satellitePosition.altitude_km.toFixed(2)} km
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.3)'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#b8c5ff', marginBottom: '0.5rem' }}>
                      Distance
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                      {satellitePosition.distance_km.toFixed(2)} km
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    background: satellitePosition.visible 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px',
                    border: satellitePosition.visible
                      ? '1px solid rgba(16, 185, 129, 0.5)'
                      : '1px solid rgba(239, 68, 68, 0.5)',
                    gridColumn: '1 / -1'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#b8c5ff', marginBottom: '0.5rem' }}>
                      <Eye size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Visibility Status
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                      {satellitePosition.visible ? '✅ Above Horizon (Potentially Visible)' : '❌ Below Horizon'}
                    </div>
                    {satellitePosition.visible ? (
                      <div style={{ fontSize: '0.9rem', color: '#b8c5ff', marginTop: '0.5rem' }}>
                        Altitude: {satellitePosition.observer_altitude.toFixed(2)}° | 
                        Azimuth: {satellitePosition.observer_azimuth.toFixed(2)}°
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: '#fca5a5', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        💡 Most satellites are below horizon at any moment. Check "Upcoming Passes" below to see when it will be visible!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Visual Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                {/* Sky Chart */}
                <div style={{
                  background: 'rgba(20, 10, 50, 0.8)',
                  border: '2px solid rgba(180, 160, 255, 0.4)',
                  borderRadius: '20px',
                  padding: '2rem',
                  backdropFilter: 'blur(15px)'
                }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', textAlign: 'center' }}>
                    Sky Position (Where to Look)
                  </h3>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1', margin: '0 auto' }}>
                    {/* Sky chart circle */}
                    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
                      {/* Horizon circle */}
                      <circle cx="100" cy="100" r="90" fill="rgba(30, 20, 80, 0.5)" stroke="#667eea" strokeWidth="2"/>
                      
                      {/* Altitude rings */}
                      <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(102, 126, 234, 0.3)" strokeWidth="1" strokeDasharray="2,2"/>
                      <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(102, 126, 234, 0.3)" strokeWidth="1" strokeDasharray="2,2"/>
                      
                      {/* Cardinal directions */}
                      <text x="100" y="15" textAnchor="middle" fill="#b8c5ff" fontSize="12" fontWeight="600">N</text>
                      <text x="185" y="105" textAnchor="middle" fill="#b8c5ff" fontSize="12" fontWeight="600">E</text>
                      <text x="100" y="195" textAnchor="middle" fill="#b8c5ff" fontSize="12" fontWeight="600">S</text>
                      <text x="15" y="105" textAnchor="middle" fill="#b8c5ff" fontSize="12" fontWeight="600">W</text>
                      
                      {/* Zenith label */}
                      <text x="100" y="100" textAnchor="middle" fill="#667eea" fontSize="10" opacity="0.5">Zenith</text>
                      
                      {/* Satellite position */}
                      {satellitePosition.visible && (() => {
                        // Convert altitude/azimuth to x,y position
                        // Altitude: 0° = edge (r=90), 90° = center (r=0)
                        // Azimuth: 0° = N, 90° = E, 180° = S, 270° = W
                        const altRad = satellitePosition.observer_altitude * (Math.PI / 180);
                        const azRad = (satellitePosition.observer_azimuth - 90) * (Math.PI / 180); // Adjust for SVG coordinates
                        const radius = 90 * (1 - satellitePosition.observer_altitude / 90);
                        const x = 100 + radius * Math.cos(azRad);
                        const y = 100 + radius * Math.sin(azRad);
                        
                        return (
                          <>
                            <circle cx={x} cy={y} r="8" fill="#10b981" stroke="#fff" strokeWidth="2"/>
                            <circle cx={x} cy={y} r="12" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.5">
                              <animate attributeName="r" from="8" to="20" dur="1.5s" repeatCount="indefinite"/>
                              <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite"/>
                            </circle>
                            <text x={x} y={y - 15} textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="600">
                              {satellitePosition.observer_altitude.toFixed(0)}°
                            </text>
                          </>
                        );
                      })()}
                      
                      {!satellitePosition.visible && (
                        <text x="100" y="100" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="600">
                          Below Horizon
                        </text>
                      )}
                    </svg>
                    <div style={{
                      textAlign: 'center',
                      marginTop: '1rem',
                      fontSize: '0.9rem',
                      color: '#b8c5ff'
                    }}>
                      {satellitePosition.visible ? (
                        <>
                          <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '0.5rem' }}>
                            ✅ Satellite is above your horizon!
                          </div>
                          <div>Look {satellitePosition.observer_azimuth.toFixed(0)}° (
                            {satellitePosition.observer_azimuth < 22.5 || satellitePosition.observer_azimuth > 337.5 ? 'North' :
                             satellitePosition.observer_azimuth < 67.5 ? 'Northeast' :
                             satellitePosition.observer_azimuth < 112.5 ? 'East' :
                             satellitePosition.observer_azimuth < 157.5 ? 'Southeast' :
                             satellitePosition.observer_azimuth < 202.5 ? 'South' :
                             satellitePosition.observer_azimuth < 247.5 ? 'Southwest' :
                             satellitePosition.observer_azimuth < 292.5 ? 'West' : 'Northwest'}
                          ) at {satellitePosition.observer_altitude.toFixed(0)}° up
                          </div>
                        </>
                      ) : (
                        <div style={{ color: '#ef4444' }}>
                          Satellite is on the other side of Earth
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ground Track Map */}
                <div style={{
                  background: 'rgba(20, 10, 50, 0.8)',
                  border: '2px solid rgba(180, 160, 255, 0.4)',
                  borderRadius: '20px',
                  padding: '2rem',
                  backdropFilter: 'blur(15px)'
                }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', textAlign: 'center' }}>
                    Ground Track (Position on Earth)
                  </h3>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '2/1', margin: '0 auto' }}>
                    <svg viewBox="0 0 360 180" style={{ width: '100%', height: '100%' }}>
                      {/* World map background */}
                      <rect x="0" y="0" width="360" height="180" fill="rgba(30, 50, 100, 0.3)" stroke="#667eea" strokeWidth="1"/>
                      
                      {/* Grid lines */}
                      {[...Array(7)].map((_, i) => (
                        <line key={`lat-${i}`} x1="0" y1={i * 30} x2="360" y2={i * 30} stroke="rgba(102, 126, 234, 0.2)" strokeWidth="0.5"/>
                      ))}
                      {[...Array(13)].map((_, i) => (
                        <line key={`lon-${i}`} x1={i * 30} y1="0" x2={i * 30} y2="180" stroke="rgba(102, 126, 234, 0.2)" strokeWidth="0.5"/>
                      ))}
                      
                      {/* Equator */}
                      <line x1="0" y1="90" x2="360" y2="90" stroke="#667eea" strokeWidth="1" strokeDasharray="3,3"/>
                      
                      {/* Prime Meridian */}
                      <line x1="180" y1="0" x2="180" y2="180" stroke="#667eea" strokeWidth="1" strokeDasharray="3,3"/>
                      
                      {/* Satellite position */}
                      {(() => {
                        // Convert lat/lon to SVG coordinates
                        // Longitude: -180 to 180 -> 0 to 360
                        // Latitude: 90 to -90 -> 0 to 180
                        const x = ((satellitePosition.longitude + 180) % 360);
                        const y = (90 - satellitePosition.latitude);
                        
                        return (
                          <>
                            <circle cx={x} cy={y} r="4" fill="#10b981" stroke="#fff" strokeWidth="1"/>
                            <circle cx={x} cy={y} r="8" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.5">
                              <animate attributeName="r" from="4" to="12" dur="1.5s" repeatCount="indefinite"/>
                              <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite"/>
                            </circle>
                          </>
                        );
                      })()}
                      
                      {/* Labels */}
                      <text x="5" y="12" fill="#b8c5ff" fontSize="8">90°N</text>
                      <text x="5" y="92" fill="#b8c5ff" fontSize="8">0°</text>
                      <text x="5" y="178" fill="#b8c5ff" fontSize="8">90°S</text>
                    </svg>
                    <div style={{
                      textAlign: 'center',
                      marginTop: '1rem',
                      fontSize: '0.9rem',
                      color: '#b8c5ff'
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                        📍 Current Location on Earth
                      </div>
                      <div>
                        Lat: {satellitePosition.latitude.toFixed(2)}° | 
                        Lon: {satellitePosition.longitude.toFixed(2)}° | 
                        Alt: {satellitePosition.altitude_km.toFixed(0)} km
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </>
            )}

            {/* Upcoming Passes */}
            {selectedSatellite && satellitePasses.length > 0 && (
              <div style={{
                background: 'rgba(20, 10, 50, 0.8)',
                border: '2px solid rgba(180, 160, 255, 0.4)',
                borderRadius: '20px',
                padding: '2rem',
                backdropFilter: 'blur(15px)',
                maxHeight: '50vh',
                overflowY: 'auto'
              }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={24} />
                  Upcoming Passes (Next 7 Days)
                </h2>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#10b981', 
                  marginBottom: '1.5rem',
                  padding: '0.75rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  ✨ These are the times when <strong>{selectedSatellite.name}</strong> will be visible from your location!
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {satellitePasses.map((pass, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '1.25rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px'
                      }}
                    >
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#667eea',
                        marginBottom: '0.75rem',
                        fontSize: '1.1rem'
                      }}>
                        Pass #{index + 1}
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                        <div>
                          <div style={{ color: '#b8c5ff' }}>Rise Time:</div>
                          <div style={{ fontWeight: '600' }}>{formatDateTime(pass.rise_time)}</div>
                        </div>
                        
                        {pass.max_time && (
                          <div>
                            <div style={{ color: '#b8c5ff' }}>Max Altitude:</div>
                            <div style={{ fontWeight: '600' }}>{pass.max_altitude?.toFixed(2)}°</div>
                          </div>
                        )}
                        
                        <div>
                          <div style={{ color: '#b8c5ff' }}>Set Time:</div>
                          <div style={{ fontWeight: '600' }}>{formatDateTime(pass.set_time)}</div>
                        </div>
                        
                        {pass.max_time && (
                          <div>
                            <div style={{ color: '#b8c5ff' }}>Peak Time:</div>
                            <div style={{ fontWeight: '600' }}>{formatDateTime(pass.max_time)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteTracker;
