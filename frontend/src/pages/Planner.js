import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Planner = () => {
  const [events, setEvents] = useState([]);
  const [astronomicalEvents, setAstronomicalEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userId] = useState('user-' + Math.random().toString(36).substr(2, 9));
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    event_type: 'meteor_shower',
    date: new Date(),
    time: '20:00',
    description: '',
    location: '',
    reminder_enabled: false
  });

  const [calendarSystem, setCalendarSystem] = useState('western');
  const [latitude, setLatitude] = useState(40.7128);
  const [longitude, setLongitude] = useState(-74.0060);

  useEffect(() => {
    fetchEvents();
    fetchAstronomicalEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/stargazing/events/${userId}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchAstronomicalEvents = async () => {
    try {
      const response = await axios.post(`${API}/astronomy/events`, {
        latitude,
        longitude,
        datetime: new Date().toISOString()
      });
      setAstronomicalEvents(response.data);
    } catch (error) {
      console.error('Error fetching astronomical events:', error);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const eventData = {
        ...newEvent,
        date: format(newEvent.date, 'yyyy-MM-dd'),
        user_id: userId
      };
      
      const response = await axios.post(`${API}/stargazing/events`, eventData);
      setEvents([...events, response.data]);
      setIsDialogOpen(false);
      toast.success('Event created successfully!');
      
      // Reset form
      setNewEvent({
        title: '',
        event_type: 'meteor_shower',
        date: new Date(),
        time: '20:00',
        description: '',
        location: '',
        reminder_enabled: false
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`${API}/stargazing/events/${eventId}`);
      setEvents(events.filter(e => e.id !== eventId));
      toast.success('Event deleted');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const formatDateByCalendar = (date) => {
    const d = new Date(date);
    
    switch(calendarSystem) {
      case 'western':
        return format(d, 'MMMM dd, yyyy');
      case 'chinese':
        // Simplified Chinese calendar representation
        const chineseYear = d.getFullYear() + 2637; // Approximate
        return `Chinese Year ${chineseYear}, ${format(d, 'MM-dd')}`;
      case 'islamic':
        // Simplified Islamic calendar representation
        const islamicYear = Math.floor((d.getFullYear() - 622) * 1.030684);
        return `Islamic Year ${islamicYear}, ${format(d, 'MM-dd')}`;
      case 'hebrew':
        // Simplified Hebrew calendar representation
        const hebrewYear = d.getFullYear() + 3760;
        return `Hebrew Year ${hebrewYear}, ${format(d, 'MM-dd')}`;
      case 'julian':
        const julianDay = Math.floor((d.getTime() / 86400000) + 2440587.5);
        return `Julian Day ${julianDay}`;
      default:
        return format(d, 'MMMM dd, yyyy');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" data-testid="back-button">
              <Button variant="outline" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.3)', color: '#e0e6ff' }}>
                <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back
              </Button>
            </Link>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fff', fontFamily: 'Orbitron' }} data-testid="planner-title">Stargazing Planner</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }} data-testid="add-event-button">
                <Plus size={20} style={{ marginRight: '0.5rem' }} /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent style={{ background: '#1a1f3a', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }}>
              <DialogHeader>
                <DialogTitle style={{ color: '#fff' }}>Create Stargazing Event</DialogTitle>
              </DialogHeader>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <Label style={{ color: '#b8c5ff' }}>Title</Label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Perseid Meteor Shower"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }}
                    data-testid="event-title-input"
                  />
                </div>
                
                <div>
                  <Label style={{ color: '#b8c5ff' }}>Event Type</Label>
                  <Select value={newEvent.event_type} onValueChange={(value) => setNewEvent({...newEvent, event_type: value})}>
                    <SelectTrigger style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }} data-testid="event-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ background: '#1a1f3a', border: '1px solid rgba(120,140,255,0.3)' }}>
                      <SelectItem value="meteor_shower">Meteor Shower</SelectItem>
                      <SelectItem value="eclipse">Eclipse</SelectItem>
                      <SelectItem value="planet_visible">Planet Viewing</SelectItem>
                      <SelectItem value="constellation">Constellation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label style={{ color: '#b8c5ff' }}>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }}
                        data-testid="event-date-picker"
                      >
                        <CalendarIcon size={16} style={{ marginRight: '0.5rem' }} />
                        {format(newEvent.date, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent style={{ background: '#1a1f3a', border: '1px solid rgba(120,140,255,0.3)' }}>
                      <Calendar
                        mode="single"
                        selected={newEvent.date}
                        onSelect={(date) => setNewEvent({...newEvent, date: date || new Date()})}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label style={{ color: '#b8c5ff' }}>Time</Label>
                  <Input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }}
                    data-testid="event-time-input"
                  />
                </div>

                <div>
                  <Label style={{ color: '#b8c5ff' }}>Location (optional)</Label>
                  <Input
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="Central Park Observatory"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }}
                    data-testid="event-location-input"
                  />
                </div>

                <div>
                  <Label style={{ color: '#b8c5ff' }}>Description</Label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Annual meteor shower with peak activity..."
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff' }}
                    data-testid="event-description-input"
                  />
                </div>

                <Button
                  onClick={handleCreateEvent}
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}
                  data-testid="create-event-button"
                >
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Calendar System Selector */}
        <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem', marginBottom: '2rem' }} data-testid="calendar-selector">
          <Label style={{ color: '#fff', marginBottom: '1rem', display: 'block' }}>Calendar System</Label>
          <Select value={calendarSystem} onValueChange={setCalendarSystem}>
            <SelectTrigger style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(120,140,255,0.3)', color: '#fff', maxWidth: '300px' }} data-testid="calendar-system-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: '#1a1f3a', border: '1px solid rgba(120,140,255,0.3)' }}>
              <SelectItem value="western">Western (Gregorian)</SelectItem>
              <SelectItem value="chinese">Chinese</SelectItem>
              <SelectItem value="islamic">Islamic (Hijri)</SelectItem>
              <SelectItem value="hebrew">Hebrew</SelectItem>
              <SelectItem value="julian">Julian Day</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Your Events */}
          <div>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem' }} data-testid="my-events-title">My Events</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.length === 0 ? (
                <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '2rem', textAlign: 'center' }}>
                  <p style={{ color: '#788cff' }}>No events yet. Create your first stargazing event!</p>
                </Card>
              ) : (
                events.map(event => (
                  <Card key={event.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem' }} data-testid={`event-${event.id}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{event.title}</h3>
                        <div style={{ color: '#788cff', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                          {formatDateByCalendar(event.date)} at {event.time}
                        </div>
                        {event.location && (
                          <div style={{ color: '#b8c5ff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            📍 {event.location}
                          </div>
                        )}
                        <p style={{ color: '#b8c5ff', marginTop: '0.5rem' }}>{event.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        style={{ color: '#ff6b6b' }}
                        data-testid={`delete-event-${event.id}`}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Astronomical Events */}
          <div>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem' }} data-testid="astronomical-events-title">Upcoming Astronomical Events</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {astronomicalEvents.map((event, index) => (
                <Card key={index} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,140,255,0.2)', padding: '1.5rem' }} data-testid={`astro-event-${index}`}>
                  <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{event.type}</h3>
                  <div style={{ color: '#788cff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    {formatDateByCalendar(event.date)}
                  </div>
                  <p style={{ color: '#b8c5ff' }}>{event.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planner;
