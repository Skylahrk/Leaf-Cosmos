import React from 'react';
import { Mail, MapPin, Github, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'rgba(20, 10, 50, 0.8)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(180, 160, 255, 0.3)',
      padding: '3rem 2rem 2rem',
      marginTop: '4rem',
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        {/* About */}
        <div>
          <h3 style={{ color: '#fff', fontFamily: 'Orbitron', fontSize: '1.5rem', marginBottom: '1rem' }}>
            Planetarium
          </h3>
          <p style={{ color: '#E6E6FA', lineHeight: '1.6', fontSize: '0.9rem' }}>
            Advanced astronomical visualization platform integrating modern science with ancient wisdom from Sūrya Siddhānta and Vaimānika Shāstra.
          </p>
          <p style={{ color: '#B8B8FF', fontSize: '0.85rem', marginTop: '1rem' }}>
            For Researchers & Astronomy Enthusiasts
          </p>
        </div>

        {/* Creator Contact */}
        <div>
          <h4 style={{ color: '#DDA0DD', fontSize: '1.2rem', marginBottom: '1rem' }}>
            Creator Contact
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E6E6FA' }}>
              <Mail size={18} style={{ color: '#9370DB' }} />
              <a href="mailto:cosmicsylahrk@gmail.com" style={{ color: '#E6E6FA', textDecoration: 'none' }}>
                cosmicsylahrk@gmail.com
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#E6E6FA' }}>
              <MapPin size={18} style={{ color: '#9370DB', marginTop: '0.2rem' }} />
              <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                Bengaluru, India
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E6E6FA' }}>
              <Github size={18} style={{ color: '#9370DB' }} />
              <a href="https://github.com/Skylahrk" target="_blank" rel="noopener noreferrer" style={{ color: '#E6E6FA', textDecoration: 'none' }}>
                github.com/Skylahrk
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E6E6FA' }}>
              <Linkedin size={18} style={{ color: '#9370DB' }} />
              <a href="https://www.linkedin.com/in/nitya-m" target="_blank" rel="noopener noreferrer" style={{ color: '#E6E6FA', textDecoration: 'none' }}>
                linkedin.com/in/nitya-m
              </a>
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 style={{ color: '#DDA0DD', fontSize: '1.2rem', marginBottom: '1rem' }}>
            Features
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, color: '#E6E6FA', fontSize: '0.9rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>• 10,000+ Star Catalog</li>
            <li style={{ marginBottom: '0.5rem' }}>• Real-time Planet Tracking</li>
            <li style={{ marginBottom: '0.5rem' }}>• 3D Constellation Viewer</li>
            <li style={{ marginBottom: '0.5rem' }}>• Ancient Astronomy Integration</li>
            <li style={{ marginBottom: '0.5rem' }}>• Interactive Solar System</li>
            <li style={{ marginBottom: '0.5rem' }}>• Multi-Calendar Support</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 style={{ color: '#DDA0DD', fontSize: '1.2rem', marginBottom: '1rem' }}>
            Resources
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#E6E6FA', fontSize: '0.9rem' }}>
            <div>Research Papers</div>
            <div>API Documentation</div>
            <div>Data Sources</div>
            <div>Ancient Texts References</div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <Github size={20} style={{ cursor: 'pointer', color: '#9370DB' }} />
              <Linkedin size={20} style={{ cursor: 'pointer', color: '#9370DB' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(180, 160, 255, 0.2)',
        marginTop: '3rem',
        paddingTop: '2rem',
        textAlign: 'center',
        color: '#B8B8FF',
        fontSize: '0.85rem'
      }}>
        <p>© 2025 Planetarium - Advanced Astronomical Research Platform</p>
        <p style={{ marginTop: '0.5rem' }}>
          Integrating Modern Science with Ancient Wisdom | Built for Researchers Worldwide
        </p>
      </div>
    </footer>
  );
};

export default Footer;
