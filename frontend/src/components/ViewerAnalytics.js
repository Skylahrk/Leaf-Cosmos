import React, { useState, useEffect } from 'react';
import { Users, Clock } from 'lucide-react';

const ViewerAnalytics = () => {
  const [viewCount, setViewCount] = useState(0);
  const [startTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Load view count from localStorage
    const storedCount = localStorage.getItem('planetarium_views');
    const newCount = storedCount ? parseInt(storedCount) + 1 : 1;
    setViewCount(newCount);
    localStorage.setItem('planetarium_views', newCount.toString());

    // Update current time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getSessionDuration = () => {
    const diff = Math.floor((currentTime - startTime) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(20, 10, 50, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(180, 160, 255, 0.3)',
      borderRadius: '12px',
      padding: '1rem',
      zIndex: 1000,
      minWidth: '200px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Users size={18} style={{ color: '#9370DB' }} />
        <div>
          <div style={{ color: '#DDA0DD', fontSize: '0.85rem' }}>Total Views</div>
          <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{viewCount.toLocaleString()}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(180, 160, 255, 0.2)' }}>
        <Clock size={18} style={{ color: '#9370DB' }} />
        <div>
          <div style={{ color: '#DDA0DD', fontSize: '0.85rem' }}>Session</div>
          <div style={{ color: '#E6E6FA', fontSize: '0.95rem' }}>{getSessionDuration()}</div>
        </div>
      </div>
      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(180, 160, 255, 0.2)', fontSize: '0.75rem', color: '#B8B8FF' }}>
        {currentTime.toLocaleString()}
      </div>
    </div>
  );
};

export default ViewerAnalytics;
