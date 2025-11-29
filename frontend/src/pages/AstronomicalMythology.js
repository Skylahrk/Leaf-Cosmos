import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Star, Globe2, Calendar, BookOpen } from 'lucide-react';

const AstronomicalMythology = () => {
  const [activeTab, setActiveTab] = useState('indian');

  const mythologies = {
    indian: {
      name: 'Indian (Vedic/Hindu)',
      icon: '🕉️',
      color: '#ff6b35',
      calendar: 'Vikram Samvat, Saka Samvat',
      content: {
        sun: {
          name: 'Surya (सूर्य)',
          description: 'The Sun god, one of the principal Vedic deities. Rides a chariot pulled by seven horses representing the seven colors of light and the seven days of the week.',
          mythology: 'According to the Rigveda, Surya is the eye of the universe (Vishvarupa). He brings light, warmth, and life to all beings. The Gayatri Mantra is addressed to Savitr, an aspect of Surya.',
          importance: 'Central to Hindu worship; Surya Namaskar (Sun Salutation) is practiced daily by millions.'
        },
        moon: {
          name: 'Chandra/Soma (चन्द्र)',
          description: 'The Moon god, associated with the mind, emotions, and medicinal plants. Waxes and wanes through 27 or 28 Nakshatras (lunar mansions).',
          mythology: 'Married to the 27 daughters of Daksha (representing the 27 Nakshatras). His favoritism toward Rohini caused the other wives to complain, leading to his curse of waxing and waning.',
          importance: 'Governs the Hindu lunar calendar; important for festival dates and agricultural timing.'
        },
        planets: {
          Mercury: 'Budha (बुध) - God of intellect and communication, son of Moon',
          Venus: 'Shukra (शुक्र) - Guru of demons, god of wealth and poetry',
          Mars: 'Mangala (मंगल) - God of war, born from Earth\'s sweat',
          Jupiter: 'Brihaspati/Guru (बृहस्पति) - Teacher of gods, god of wisdom',
          Saturn: 'Shani (शनि) - God of karma and justice, son of Surya',
          Rahu: 'North lunar node - Demon\'s head causing eclipses',
          Ketu: 'South lunar node - Demon\'s tail, spiritual liberation'
        },
        nakshatras: 'The 27 Nakshatras (lunar mansions) divide the zodiac, each with its own deity, mythology, and influence on human life.',
        text: 'Ancient texts: Vedanga Jyotisha, Surya Siddhanta, Aryabhatiya'
      }
    },
    greek: {
      name: 'Greek/Roman (Gregorian)',
      icon: '🏛️',
      color: '#4a90e2',
      calendar: 'Gregorian Calendar',
      content: {
        sun: {
          name: 'Helios/Sol',
          description: 'Titan god of the Sun who drives a golden chariot across the sky each day. Later merged with Apollo.',
          mythology: 'Son of Hyperion and Theia. Drives his chariot from east to west, bringing daylight. His son Phaethon famously crashed the sun chariot.',
          importance: 'Central to Greek worship; the Colossus of Rhodes depicted Helios.'
        },
        moon: {
          name: 'Selene/Luna',
          description: 'Titaness of the Moon, sister of Helios. Drives a silver chariot pulled by two white horses.',
          mythology: 'Fell in love with the mortal shepherd Endymion and asked Zeus to grant him eternal sleep so she could visit him every night.',
          importance: 'Moon phases influenced Greek agriculture and navigation.'
        },
        planets: {
          Mercury: 'Hermes/Mercury - Messenger of gods, god of commerce and travel',
          Venus: 'Aphrodite/Venus - Goddess of love and beauty',
          Mars: 'Ares/Mars - God of war and bloodshed',
          Jupiter: 'Zeus/Jupiter - King of gods, god of sky and thunder',
          Saturn: 'Cronus/Saturn - Titan of time and harvest, father of Zeus'
        },
        constellations: 'Greek mythology gave names to most Western constellations: Orion the Hunter, Ursa Major (Great Bear), Cassiopeia the Queen, etc.',
        text: 'Ancient texts: Ptolemy\'s Almagest, Aratus\' Phaenomena'
      }
    },
    chinese: {
      name: 'Chinese',
      icon: '🐉',
      color: '#e63946',
      calendar: 'Chinese Lunar Calendar',
      content: {
        sun: {
          name: 'Taiyang (太陽)',
          description: 'The Sun, associated with Yang energy, heaven, and the emperor. Ten suns once existed in ancient mythology.',
          mythology: 'Legend tells of Hou Yi shooting down nine of ten suns when they all appeared together, scorching the Earth. Only one sun remained.',
          importance: 'Symbol of imperial power; solar eclipses were seen as cosmic warnings.'
        },
        moon: {
          name: 'Yue/Chang\'e (月/嫦娥)',
          description: 'The Moon, associated with Yin energy and feminine power. Home to the Moon goddess Chang\'e.',
          mythology: 'Chang\'e drank the elixir of immortality and floated to the Moon. She lives there with the Jade Rabbit who pounds medicine.',
          importance: 'Mid-Autumn Festival celebrates the Moon; lunar calendar guides festivals and agriculture.'
        },
        planets: {
          Mercury: 'Shuixing (水星) - Water Star',
          Venus: 'Jinxing (金星) - Metal/Gold Star, also called Taibai (Great White)',
          Mars: 'Huoxing (火星) - Fire Star',
          Jupiter: 'Muxing (木星) - Wood Star, the largest and most auspicious',
          Saturn: 'Tuxing (土星) - Earth Star'
        },
        astronomy: 'Chinese astronomy identified 28 Lunar Mansions (宿), Three Enclosures, and Four Symbols (Azure Dragon, White Tiger, Vermilion Bird, Black Tortoise).',
        text: 'Ancient texts: Book of Documents, Gan De star catalog (4th century BCE)'
      }
    },
    hebrew: {
      name: 'Hebrew/Jewish',
      icon: '✡️',
      color: '#4ecdc4',
      calendar: 'Hebrew Lunisolar Calendar',
      content: {
        sun: {
          name: 'Shemesh (שֶׁמֶשׁ)',
          description: 'The Sun, created on the fourth day of Creation to rule the day and mark seasons.',
          mythology: 'In Joshua 10:12-13, the Sun stood still over Gibeon during a battle. The Sun is a created object serving God\'s purpose, not a deity.',
          importance: 'Marks prayer times and determines the Hebrew calendar alongside the Moon.'
        },
        moon: {
          name: 'Yarei\'ach/Levanah (יָרֵחַ/לְבָנָה)',
          description: 'The Moon, created to rule the night and mark months. The Hebrew calendar is lunisolar.',
          mythology: 'In rabbinic literature, the Moon complained about being smaller than the Sun, so God made it even smaller as punishment.',
          importance: 'Determines Jewish holidays; Rosh Chodesh celebrates the new moon each month.'
        },
        planets: {
          Mercury: 'Kokhav Chama (כוכב חמה) - Hot Star',
          Venus: 'Noga (נוגה) - Brightness/Splendor, morning and evening star',
          Mars: 'Ma\'adim (מאדים) - Reddish one',
          Jupiter: 'Tzedek (צדק) - Righteousness/Justice',
          Saturn: 'Shabtai (שבתאי) - Rester, associated with Sabbath'
        },
        constellations: 'Hebrew astronomy includes Kimah (Pleiades), Kesil (Orion), Ash (Ursa Major), and Mazzalot (Zodiac).',
        text: 'Biblical references: Job 38:31-32, Amos 5:8; Later works by Abraham ibn Ezra'
      }
    },
    arabic: {
      name: 'Arabic/Islamic',
      icon: '☪️',
      color: '#2a9d8f',
      calendar: 'Islamic Lunar Calendar (Hijri)',
      content: {
        sun: {
          name: 'Ash-Shams (الشمس)',
          description: 'The Sun, a sign of Allah\'s creation. Mentioned in Surah Ash-Shams (The Sun).',
          mythology: 'Created as a source of light and a means to calculate time. Not worshipped but respected as Allah\'s creation.',
          importance: 'Determines prayer times; solar calculations are crucial for Islamic astronomy.'
        },
        moon: {
          name: 'Al-Qamar (القمر)',
          description: 'The Moon, symbol of Islam. The crescent moon marks the beginning of each Islamic month.',
          mythology: 'The splitting of the Moon is mentioned in the Quran (54:1) as a miracle shown to the Quraysh.',
          importance: 'Determines Ramadan, Eid, and all Islamic months; moon sighting is a sacred duty.'
        },
        planets: {
          Mercury: 'Utarid (عطارد)',
          Venus: 'Zuhra (الزهرة) - The Bright One',
          Mars: 'Mirrikh (المريخ)',
          Jupiter: 'Mushtari (المشتري)',
          Saturn: 'Zuhal (زحل)'
        },
        stars: 'Many star names used today are Arabic: Aldebaran (الدبران), Betelgeuse (بيت الجوزاء), Rigel, Vega, Altair, Deneb.',
        text: 'Islamic Golden Age produced great astronomers: Al-Battani, Al-Sufi, Ibn Yunus, Al-Biruni'
      }
    },
    mayan: {
      name: 'Mayan/Mesoamerican',
      icon: '🔺',
      color: '#f4a261',
      calendar: 'Mayan Long Count Calendar',
      content: {
        sun: {
          name: 'Kinich Ahau',
          description: 'The Sun god, depicted with a jaguar face. Associated with war and sacrifice.',
          mythology: 'Each night, the Sun transforms into a jaguar and travels through Xibalba (the underworld) before rising again.',
          importance: 'Central to Mayan cosmology; temples aligned with solar phenomena like equinoxes.'
        },
        moon: {
          name: 'Ix Chel',
          description: 'The Moon goddess, associated with fertility, weaving, and medicine.',
          mythology: 'Wife of Kinich Ahau. She was associated with healing and childbirth. Sometimes depicted with a rabbit.',
          importance: 'Lunar cycles guided agricultural activities and religious ceremonies.'
        },
        planets: {
          Venus: 'Noh Ek (Great Star) or Chak Ek (Red Star) - Most important planet, associated with war and sacrifice',
          Mars: 'Hun Ahau - Associated with warfare',
          Jupiter: 'Associated with rain and agriculture',
          Saturn: 'Known but less documented in surviving texts'
        },
        astronomy: 'Mayans had incredibly accurate calendars: Tzolkin (260-day sacred), Haab (365-day civil), and Long Count. Venus cycle tracked with 99.9% accuracy.',
        text: 'Surviving codices: Dresden Codex (astronomy), Madrid Codex, Paris Codex'
      }
    }
  };

  const current = mythologies[activeTab];

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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <Link to="/" style={{ color: '#667eea', textDecoration: 'none' }}>
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>
              Astronomical Mythologies
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#b8c5ff', marginTop: '0.5rem' }}>
              Explore how different cultures interpret the cosmos
            </p>
          </div>
        </div>

        {/* Culture Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {Object.entries(mythologies).map(([key, culture]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: '1rem 2rem',
                background: activeTab === key
                  ? culture.color
                  : 'rgba(255, 255, 255, 0.1)',
                border: activeTab === key
                  ? `2px solid ${culture.color}`
                  : '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{culture.icon}</span>
              {culture.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{
          background: 'rgba(20, 10, 50, 0.9)',
          border: `3px solid ${current.color}`,
          borderRadius: '24px',
          padding: '3rem',
          backdropFilter: 'blur(15px)'
        }}>
          {/* Culture Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem',
            paddingBottom: '2rem',
            borderBottom: `2px solid ${current.color}`
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{current.icon}</div>
            <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', color: current.color }}>
              {current.name}
            </h2>
            <div style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: `${current.color}33`,
              border: `1px solid ${current.color}`,
              borderRadius: '12px',
              fontSize: '1.1rem'
            }}>
              <Calendar size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Calendar System: {current.calendar}
            </div>
          </div>

          {/* Sun Section */}
          <div style={{
            marginBottom: '2.5rem',
            padding: '2rem',
            background: 'rgba(255, 193, 7, 0.1)',
            border: '2px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <Sun size={40} color="#ffc107" />
              <h3 style={{ fontSize: '2rem', margin: 0, color: '#ffc107' }}>
                {current.content.sun.name}
              </h3>
            </div>
            <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#e8e8e8' }}>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Description:</strong> {current.content.sun.description}
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Mythology:</strong> {current.content.sun.mythology}
              </p>
              <p style={{
                padding: '1rem',
                background: 'rgba(255, 193, 7, 0.2)',
                borderRadius: '12px',
                borderLeft: '4px solid #ffc107'
              }}>
                <strong>Cultural Importance:</strong> {current.content.sun.importance}
              </p>
            </div>
          </div>

          {/* Moon Section */}
          <div style={{
            marginBottom: '2.5rem',
            padding: '2rem',
            background: 'rgba(156, 163, 175, 0.1)',
            border: '2px solid rgba(156, 163, 175, 0.3)',
            borderRadius: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <Moon size={40} color="#cbd5e1" />
              <h3 style={{ fontSize: '2rem', margin: 0, color: '#cbd5e1' }}>
                {current.content.moon.name}
              </h3>
            </div>
            <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#e8e8e8' }}>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Description:</strong> {current.content.moon.description}
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Mythology:</strong> {current.content.moon.mythology}
              </p>
              <p style={{
                padding: '1rem',
                background: 'rgba(156, 163, 175, 0.2)',
                borderRadius: '12px',
                borderLeft: '4px solid #cbd5e1'
              }}>
                <strong>Cultural Importance:</strong> {current.content.moon.importance}
              </p>
            </div>
          </div>

          {/* Planets Section */}
          <div style={{
            marginBottom: '2.5rem',
            padding: '2rem',
            background: `${current.color}15`,
            border: `2px solid ${current.color}55`,
            borderRadius: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <Globe2 size={40} color={current.color} />
              <h3 style={{ fontSize: '2rem', margin: 0, color: current.color }}>
                Planets
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(current.content.planets).map(([planet, description]) => (
                <div
                  key={planet}
                  style={{
                    padding: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px'
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem', color: current.color }}>
                    {planet}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#d1d5db' }}>
                    {description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: current.content.constellations ? '1fr 1fr' : '1fr',
            gap: '2rem'
          }}>
            {current.content.astronomy && (
              <div style={{
                padding: '2rem',
                background: 'rgba(102, 126, 234, 0.1)',
                border: '2px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Star size={24} color="#667eea" />
                  <h4 style={{ fontSize: '1.5rem', margin: 0, color: '#667eea' }}>Astronomy</h4>
                </div>
                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#d1d5db' }}>
                  {current.content.astronomy}
                </p>
              </div>
            )}

            {current.content.constellations && (
              <div style={{
                padding: '2rem',
                background: 'rgba(102, 126, 234, 0.1)',
                border: '2px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Star size={24} color="#667eea" />
                  <h4 style={{ fontSize: '1.5rem', margin: 0, color: '#667eea' }}>Constellations</h4>
                </div>
                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#d1d5db' }}>
                  {current.content.constellations}
                </p>
              </div>
            )}

            {current.content.nakshatras && (
              <div style={{
                padding: '2rem',
                background: 'rgba(102, 126, 234, 0.1)',
                border: '2px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Star size={24} color="#667eea" />
                  <h4 style={{ fontSize: '1.5rem', margin: 0, color: '#667eea' }}>Nakshatras</h4>
                </div>
                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#d1d5db' }}>
                  {current.content.nakshatras}
                </p>
              </div>
            )}

            {current.content.stars && (
              <div style={{
                padding: '2rem',
                background: 'rgba(102, 126, 234, 0.1)',
                border: '2px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Star size={24} color="#667eea" />
                  <h4 style={{ fontSize: '1.5rem', margin: 0, color: '#667eea' }}>Star Names</h4>
                </div>
                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#d1d5db' }}>
                  {current.content.stars}
                </p>
              </div>
            )}
          </div>

          {/* Ancient Texts */}
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(147, 51, 234, 0.1)',
            border: '2px solid rgba(147, 51, 234, 0.3)',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <BookOpen size={24} color="#9333ea" />
              <h4 style={{ fontSize: '1.3rem', margin: 0, color: '#9333ea' }}>Ancient Astronomical Texts</h4>
            </div>
            <p style={{ fontSize: '1rem', color: '#d1d5db', margin: 0 }}>
              {current.content.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AstronomicalMythology;
