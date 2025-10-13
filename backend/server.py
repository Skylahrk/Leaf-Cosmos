from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import requests
from skyfield.api import load, wgs84
from skyfield import almanac
import ephem
import math

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class CustomConstellation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    stars: List[dict]  # List of star positions [{x, y, ra, dec, name}]
    lines: List[List[int]]  # List of connections between stars
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StargazingEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    event_type: str  # meteor_shower, eclipse, planet_visible, etc
    date: str
    time: str
    description: str
    location: Optional[str] = None
    user_id: str
    reminder_enabled: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LocationData(BaseModel):
    latitude: float
    longitude: float
    datetime: str

# NASA APOD endpoint
@api_router.get("/nasa/apod")
async def get_nasa_apod():
    """Get NASA Astronomy Picture of the Day"""
    try:
        # Using DEMO_KEY for now - in production, would use environment variable
        api_key = os.environ.get('NASA_API_KEY', 'DEMO_KEY')
        response = requests.get(f'https://api.nasa.gov/planetary/apod?api_key={api_key}')
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching NASA APOD: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch NASA data")

# Get planet positions
@api_router.post("/planets/positions")
async def get_planet_positions(location: LocationData):
    """Get current positions of planets for given location and time"""
    try:
        # Parse datetime - convert ISO format to datetime object
        from datetime import datetime
        dt = datetime.fromisoformat(location.datetime.replace('Z', '+00:00'))
        obs_time = ephem.Date(dt)
        
        # Create observer
        observer = ephem.Observer()
        observer.lat = str(location.latitude)
        observer.lon = str(location.longitude)
        observer.date = obs_time
        
        planets = {
            'Mercury': ephem.Mercury(observer),
            'Venus': ephem.Venus(observer),
            'Mars': ephem.Mars(observer),
            'Jupiter': ephem.Jupiter(observer),
            'Saturn': ephem.Saturn(observer),
            'Uranus': ephem.Uranus(observer),
            'Neptune': ephem.Neptune(observer),
            'Moon': ephem.Moon(observer),
            'Sun': ephem.Sun(observer)
        }
        
        result = {}
        for name, body in planets.items():
            result[name] = {
                'name': name,
                'altitude': float(body.alt) * 180 / math.pi,  # Convert to degrees
                'azimuth': float(body.az) * 180 / math.pi,
                'ra': float(body.ra) * 180 / math.pi,  # Right ascension
                'dec': float(body.dec) * 180 / math.pi,  # Declination
                'visible': float(body.alt) > 0,  # Above horizon
                'magnitude': float(body.mag) if hasattr(body, 'mag') else None
            }
        
        return result
    except Exception as e:
        logger.error(f"Error calculating planet positions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Get stars data
@api_router.post("/stars/visible")
async def get_visible_stars(location: LocationData):
    """Get visible stars for given location and time"""
    try:
        # Parse datetime - convert ISO format to datetime object
        from datetime import datetime
        dt = datetime.fromisoformat(location.datetime.replace('Z', '+00:00'))
        obs_time = ephem.Date(dt)
        
        # Famous bright stars with their coordinates
        bright_stars = [
            {'name': 'Sirius', 'ra': 101.287, 'dec': -16.716, 'magnitude': -1.46},
            {'name': 'Canopus', 'ra': 95.988, 'dec': -52.696, 'magnitude': -0.74},
            {'name': 'Arcturus', 'ra': 213.915, 'dec': 19.182, 'magnitude': -0.05},
            {'name': 'Vega', 'ra': 279.234, 'dec': 38.783, 'magnitude': 0.03},
            {'name': 'Capella', 'ra': 79.172, 'dec': 45.998, 'magnitude': 0.08},
            {'name': 'Rigel', 'ra': 78.634, 'dec': -8.202, 'magnitude': 0.13},
            {'name': 'Procyon', 'ra': 114.825, 'dec': 5.225, 'magnitude': 0.38},
            {'name': 'Betelgeuse', 'ra': 88.793, 'dec': 7.407, 'magnitude': 0.50},
            {'name': 'Altair', 'ra': 297.696, 'dec': 8.868, 'magnitude': 0.77},
            {'name': 'Aldebaran', 'ra': 68.980, 'dec': 16.509, 'magnitude': 0.85},
            {'name': 'Spica', 'ra': 201.298, 'dec': -11.161, 'magnitude': 0.98},
            {'name': 'Antares', 'ra': 247.352, 'dec': -26.432, 'magnitude': 1.09},
            {'name': 'Pollux', 'ra': 116.329, 'dec': 28.026, 'magnitude': 1.14},
            {'name': 'Deneb', 'ra': 310.358, 'dec': 45.280, 'magnitude': 1.25},
            {'name': 'Regulus', 'ra': 152.093, 'dec': 11.967, 'magnitude': 1.35}
        ]
        
        # Calculate visibility for each star
        observer = ephem.Observer()
        observer.lat = str(location.latitude)
        observer.lon = str(location.longitude)
        observer.date = obs_time
        
        visible_stars = []
        for star in bright_stars:
            star_obj = ephem.FixedBody()
            star_obj._ra = ephem.degrees(str(star['ra']))
            star_obj._dec = ephem.degrees(str(star['dec']))
            star_obj.compute(observer)
            
            altitude = float(star_obj.alt) * 180 / math.pi
            if altitude > 0:  # Above horizon
                visible_stars.append({
                    'name': star['name'],
                    'ra': star['ra'],
                    'dec': star['dec'],
                    'magnitude': star['magnitude'],
                    'altitude': altitude,
                    'azimuth': float(star_obj.az) * 180 / math.pi
                })
        
        return visible_stars
    except Exception as e:
        logger.error(f"Error getting visible stars: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Constellation data
@api_router.get("/constellations")
async def get_constellations():
    """Get standard constellation data"""
    constellations = [
        {'name': 'Ursa Major', 'common_name': 'Great Bear', 'best_month': 'April'},
        {'name': 'Orion', 'common_name': 'The Hunter', 'best_month': 'January'},
        {'name': 'Cassiopeia', 'common_name': 'The Queen', 'best_month': 'November'},
        {'name': 'Leo', 'common_name': 'The Lion', 'best_month': 'April'},
        {'name': 'Scorpius', 'common_name': 'The Scorpion', 'best_month': 'July'},
        {'name': 'Cygnus', 'common_name': 'The Swan', 'best_month': 'September'},
        {'name': 'Sagittarius', 'common_name': 'The Archer', 'best_month': 'August'},
        {'name': 'Aquarius', 'common_name': 'The Water Bearer', 'best_month': 'October'},
        {'name': 'Gemini', 'common_name': 'The Twins', 'best_month': 'February'},
        {'name': 'Taurus', 'common_name': 'The Bull', 'best_month': 'January'}
    ]
    return constellations

# Custom constellations CRUD
@api_router.post("/constellations/custom", response_model=CustomConstellation)
async def create_custom_constellation(constellation: CustomConstellation):
    """Save a custom constellation"""
    doc = constellation.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.custom_constellations.insert_one(doc)
    return constellation

@api_router.get("/constellations/custom/{user_id}", response_model=List[CustomConstellation])
async def get_user_constellations(user_id: str):
    """Get all custom constellations for a user"""
    constellations = await db.custom_constellations.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(100)
    
    for const in constellations:
        if isinstance(const['created_at'], str):
            const['created_at'] = datetime.fromisoformat(const['created_at'])
    
    return constellations

@api_router.delete("/constellations/custom/{constellation_id}")
async def delete_custom_constellation(constellation_id: str):
    """Delete a custom constellation"""
    result = await db.custom_constellations.delete_one({"id": constellation_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Constellation not found")
    return {"message": "Constellation deleted"}

# Stargazing events CRUD
@api_router.post("/stargazing/events", response_model=StargazingEvent)
async def create_stargazing_event(event: StargazingEvent):
    """Create a stargazing event/reminder"""
    doc = event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.stargazing_events.insert_one(doc)
    return event

@api_router.get("/stargazing/events/{user_id}", response_model=List[StargazingEvent])
async def get_user_stargazing_events(user_id: str):
    """Get all stargazing events for a user"""
    events = await db.stargazing_events.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(100)
    
    for event in events:
        if isinstance(event['created_at'], str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
    
    return events

@api_router.delete("/stargazing/events/{event_id}")
async def delete_stargazing_event(event_id: str):
    """Delete a stargazing event"""
    result = await db.stargazing_events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted"}

# Astronomical events
@api_router.post("/astronomy/events")
async def get_astronomical_events(location: LocationData):
    """Get upcoming astronomical events"""
    try:
        obs_time = ephem.Date(location.datetime)
        observer = ephem.Observer()
        observer.lat = str(location.latitude)
        observer.lon = str(location.longitude)
        observer.date = obs_time
        
        events = []
        
        # Moon phases
        next_full = ephem.next_full_moon(obs_time)
        next_new = ephem.next_new_moon(obs_time)
        
        events.append({
            'type': 'Full Moon',
            'date': str(next_full),
            'description': 'Next full moon'
        })
        
        events.append({
            'type': 'New Moon',
            'date': str(next_new),
            'description': 'Next new moon'
        })
        
        return events
    except Exception as e:
        logger.error(f"Error getting astronomical events: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/")
async def root():
    return {"message": "Planetarium API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
