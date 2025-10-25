import React, { useState, useEffect } from 'react';
import { Users, Clock, ChevronUp, ChevronDown } from 'lucide-react';

const ViewerAnalytics = () => {
  const [viewCount, setViewCount] = useState(0);
  const [startTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMinimized, setIsMinimized] = useState(() => {
    const saved = localStorage.getItem('analytics_minimized');
    return saved === 'true';
  });

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

  const toggleMinimize = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    localStorage.setItem('analytics_minimized', newState.toString());
  };

  if (isMinimized) {
    return (
      <div 
        onClick={toggleMinimize}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: 'rgba(20, 10, 50, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(180, 160, 255, 0.3)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          zIndex: 1000,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <Users size={16} style={{ color: '#9370DB' }} />
        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>{viewCount}</span>
        <ChevronUp size={16} style={{ color: '#DDA0DD' }} />
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'rgba(20, 10, 50, 0.9)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(180, 160, 255, 0.3)',
      borderRadius: '12px',
      padding: '1rem',
      zIndex: 1000,
      minWidth: '200px',
      boxShadow: '0 4px 20px rgba(147, 112, 219, 0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} style={{ color: '#9370DB' }} />
          <div>
            <div style={{ color: '#DDA0DD', fontSize: '0.85rem' }}>Total Views</div>
            <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{viewCount.toLocaleString()}</div>
          </div>
        </div>
        <button
          onClick={toggleMinimize}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#DDA0DD',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#DDA0DD'}
        >
          <ChevronDown size={20} />
        </button>
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
