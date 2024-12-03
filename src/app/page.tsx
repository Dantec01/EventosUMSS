'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Calendar as CalendarIcon, Clock, MapPin, LogIn, Heart, ArrowLeft, ChevronDown } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

//import './globals.css'

// Eliminar la importación de eventsData
// import eventsData from '@/lib/events.json'

interface Event {
  id: number
  title: string
  category: string
  date: string
  time: string
  location: string
  description: string
  image: string
  isSaved?: boolean
}

interface Category {
  name: string
  image: string
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("categories")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: '',
    date: '',
    time: '',
    location: '',
    description: '',
    image: null as File | null
  })
  const [events, setEvents] = useState<Event[]>([])
  const [latestEvents, setLatestEvents] = useState<Event[]>([])
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [currentMonthEvents, setCurrentMonthEvents] = useState<Event[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch('/api/eventos');
        const data = await response.json();
        const allEvents = data.map((event: Event) => ({ ...event, isSaved: false }));
        
        // Ordenar por ID en orden descendente (los más recientes primero)
        const sortedEvents = allEvents.sort((a: Event, b: Event) => b.id - a.id);
        
        setEvents(sortedEvents);
        
        // Obtener los 5 eventos más recientes
        setLatestEvents(sortedEvents.slice(0, 5));
        setIsLoading(false);

        // Si el usuario está autenticado, cargar sus favoritos después de cargar los eventos
        if (isAuthenticated && token) {
          loadFavorites();
        }
      } catch (error) {
        console.error('Error cargando eventos:', error);
        setIsLoading(false);
      }
    };

    const loadFavorites = async () => {
      try {
        const response = await fetch('/api/favoritos', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const favoriteIds = data.map((fav: any) => fav.id);
          setFavorites(favoriteIds);
          setEvents(prevEvents => 
            prevEvents.map(event => ({
              ...event,
              isSaved: favoriteIds.includes(event.id)
            }))
          );
          // Actualizar también los eventos más recientes
          setLatestEvents(prevLatest => 
            prevLatest.map(event => ({
              ...event,
              isSaved: favoriteIds.includes(event.id)
            }))
          );
        } else if (response.status === 401) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setToken(null);
        }
      } catch (error) {
        console.error('Error al cargar favoritos:', error);
      }
    };

    loadEvents();
  }, [isAuthenticated, token]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEventIndex((prevIndex) => (prevIndex + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (events.length > 0) {
      const today = new Date();
      setDate(today);
      setCurrentMonthEvents(getEventsForSelectedDate(today, events));
    }
  }, [events]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const categories: Category[] = [
    { name: "Música", image: "/images/musica.webp" },
    { name: "Cursos", image: "/images/cursos.jpg?height=200&width=300" },
    { name: "Deportes", image: "/images/deportes.jpg?height=200&width=300" },
    { name: "Charlas", image: "/images/charlas.png?height=200&width=300" },
    { name: "Talleres", image: "/images/talleres.jpg?height=200&width=300" },
    { name: "Otros", image: "/images/otros.jpg?height=200&width=300" },
  ]

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event)
  }

  const filteredEvents = events.filter(event => 
    (showSavedOnly ? event.isSaved : true) &&
    (selectedCategory ? event.category === selectedCategory : true) &&
    (event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.date.includes(searchTerm) ||
    event.time.includes(searchTerm))
  )

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setActiveTab("events")
  }

  const handleNewEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewEvent(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewEvent({...newEvent, image: e.target.files[0]});
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos
    if (!newEvent.title || !newEvent.category || !newEvent.date || 
        !newEvent.time || !newEvent.location || !newEvent.description || !newEvent.image) {
      alert('Por favor, complete todos los campos');
      return;
    }

    const formData = new FormData();
    formData.append('title', newEvent.title);
    formData.append('category', newEvent.category);
    formData.append('date', newEvent.date);
    formData.append('time', newEvent.time);
    formData.append('location', newEvent.location);
    formData.append('description', newEvent.description);
    formData.append('image', newEvent.image);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear evento');
      }

      const createdEvent = await response.json();
      setEvents([...events, createdEvent]);
      
      // Resetear formulario
      setNewEvent({
        title: '',
        category: '',
        date: '',
        time: '',
        location: '',
        description: '',
        image: null
      });

      alert('Evento creado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const toggleFavorite = async (eventId: number) => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }

    try {
      const method = favorites.includes(eventId) ? 'DELETE' : 'POST';
      const response = await fetch('/api/favoritos', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ evento_id: eventId })
      });

      const data = await response.json();

      if (response.ok || response.status === 409) { 
        if (method === 'DELETE') {
          setFavorites(prev => prev.filter(id => id !== eventId));
        } else {
          setFavorites(prev => [...prev, eventId]);
        }
        
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === eventId
              ? { ...event, isSaved: !event.isSaved }
              : event
          )
        );

        // Actualizar también los eventos más recientes
        setLatestEvents(prevLatest => 
          prevLatest.map(event =>
            event.id === eventId
              ? { ...event, isSaved: !event.isSaved }
              : event
          )
        );

        // Actualizar los eventos del mes actual
        setCurrentMonthEvents(getEventsForSelectedDate(date, events));
      } else {
        console.error('Error al actualizar favorito:', data.error);
        if (response.status === 401) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setToken(null);
          setIsLoginOpen(true);
        }
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    }
  };

  const getVisibleEvents = () => {
    return latestEvents.slice(currentEventIndex, currentEventIndex + 3)
  }

  const toggleShowSavedOnly = () => {
    setShowSavedOnly(!showSavedOnly)
    setActiveTab("events")
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
  }

  const handleShowAllEvents = () => {
    setShowSavedOnly(false)
  }

  const getSavedEventDates = () => {
    return events
      .filter(event => event.isSaved)
      .map(event => new Date(event.date))
  }

  const getEventsForSelectedDate = (selectedDate: Date | undefined, eventsList = events) => {
    if (!eventsList) return [];
    if (!selectedDate) return eventsList.filter(event => event.isSaved);
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    const selectedDay = selectedDate.getDate();
    return eventsList.filter(event => {
      const eventDate = new Date(event.date);
      if (eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear) {
        if (selectedDay === eventDate.getDate() || selectedDate.getDate() === 1) {
          return event.isSaved;
        }
      }
      return false;
    });
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    setCurrentMonthEvents(getEventsForSelectedDate(newDate, events));
  };

  const handleMonthChange = (newMonth: Date) => {
    const firstDayOfMonth = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1);
    setDate(undefined);
    setCurrentMonthEvents(getEventsForSelectedDate(firstDayOfMonth, events));
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: (document.getElementById('email') as HTMLInputElement).value,
          password: (document.getElementById('password') as HTMLInputElement).value,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setLoginError(errorData.error);
        return;
      }
  
      const data = await response.json();
      localStorage.setItem('token', data.token); // Guardar token en localStorage
      setIsAuthenticated(true);
      setToken(data.token);
      setIsLoginOpen(false);
      setLoginError(null);
    } catch (error) {
      setLoginError('Error al iniciar sesión. Por favor, inténtelo de nuevo.');
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando eventos...</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-gradient-to-r from-red-500 to-blue-500 border-b border-border rounded-b-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d1/UMSS.png" alt="UMSS Logo" className="w-6 h-8" />
            <span className="text-lg font-semibold text-white">Eventos UMSS</span>
          </div>
          {isAuthenticated ? (
            <Button size="sm" variant="ghost" onClick={() => {
              localStorage.removeItem('token')
              setIsAuthenticated(false)
              setToken(null)
            }}>
              Logout
            </Button>
          ) : (
            <Button size="sm" variant="ghost" className="bg-green-400 hover:bg-green-500" onClick={() => setIsLoginOpen(true)}>
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2 p-4">
          <Input 
            type="search" 
            placeholder="Buscar eventos..." 
            className="flex-grow bg-white" 
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button size="icon" onClick={() => handleSearch(searchTerm)}>
            <Search className="h-4 w-4" />
            <span className="sr-only">Buscar</span>
          </Button>
          <Button 
            size="icon" 
            variant={showSavedOnly ? "default" : "outline"} 
            onClick={toggleShowSavedOnly}
            className={showSavedOnly ? "hover:bg-red-500" : ""}
            disabled={!isAuthenticated}
          >
            <Heart className={`h-4 w-4 ${showSavedOnly ? 'fill-current' : ''}`} />
            <span className="sr-only">Mostrar favoritos</span>
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-6 bg-gray-100">
        {!selectedCategory && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-red-500 to-blue-500">
              <TabsTrigger value="categories" className="flex-grow text-white">Categorías</TabsTrigger>
              <TabsTrigger value="events" className="flex-grow text-white">Eventos</TabsTrigger>
              <TabsTrigger value="calendar" className={`flex-grow text-white ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isAuthenticated}>Calendario</TabsTrigger>
              <TabsTrigger value="add" className={`flex-grow text-white ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isAuthenticated}>Agregar</TabsTrigger>
            </TabsList>
            <TabsContent value="categories">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {categories.map((category) => (
                  <Card 
                    key={category.name} 
                    className="cursor-pointer overflow-hidden"
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <CardContent className="p-0 relative h-32">
                      <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <h3 className="text-white text-lg font-semibold">{category.name}</h3>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <section aria-label="Últimos eventos" className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Últimos eventos</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getVisibleEvents().map((event) => (
                    <Card 
                      key={event.id} 
                      className="overflow-hidden transition-all duration-500 ease-in-out cursor-pointer hover:shadow-lg"
                      onClick={() => openEventDetails(event)}
                    >
                      <CardContent className="p-0 relative h-48">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 p-4 flex flex-col justify-end">
                          <h3 className="font-semibold text-white">{event.title}</h3>
                          <p className="text-sm text-gray-200">{event.category}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-200">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-200">
                            <Clock className="h-4 w-4 mr-2" />
                            {event.time}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </TabsContent>
            <TabsContent value="events">
              {showSavedOnly && (
                <div className="flex justify-center mt-4 mb-4">
                  <Button onClick={handleShowAllEvents} className="bg-teal-500 hover:bg-teal-600 text-white">
                    Mostrar todos los eventos
                  </Button>
                </div>
              )}
              <div className="space-y-2 mt-4">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex-grow cursor-pointer" onClick={() => openEventDetails(event)}>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm  text-muted-foreground">{event.category}</p>
                        <div className="flex items-center mt-1 text-sm">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {formatDate(event.date)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-4"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(event.id)
                        }}
                        disabled={!isAuthenticated}
                      >
                        <Heart className={`h-6 w-6 ${event.isSaved ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                        <span className="sr-only">{event.isSaved ? 'Quitar de favoritos' : 'Agregar a favoritos'}</span>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="calendar">
              {isAuthenticated ? (
                <div className="flex flex-col md:flex-row gap-4">
                  <Card className="w-full md:w-1/2">
                    <CardContent className="p-0 flex justify-center">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        onMonthChange={handleMonthChange}
                        className="rounded-md border shadow"
                        modifiers={{
                          saved: getSavedEventDates(),
                        }}
                        modifiersStyles={{
                          saved: { backgroundColor: 'rgba(239, 68, 68, 0.5)' },
                        }}
                        defaultMonth={new Date()}
                        initialFocus
                      />
                    </CardContent>
                  </Card>
                  <Card className="w-full md:w-1/2">
                    <CardContent>
                      <h3 className="text-lg font-semibold mb-4">
                        {date
                          ? `Eventos favoritos del ${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`
                          : `Eventos favoritos del mes`}
                      </h3>
                      <div className="space-y-2">
                        {currentMonthEvents.map((event) => (
                          <div key={event.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{event.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => openEventDetails(event)}>
                              Ver detalles
                            </Button>
                          </div>
                        ))}
                        {currentMonthEvents.length === 0 && (
                          <p className="text-muted-foreground">No hay eventos favoritos para este mes.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="p-4">
                  <p>Por favor, inicia sesión para ver el calendario.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="add">
              {isAuthenticated ? (
                <Card className="bg-gray-200">
                  <CardContent>
                    <h2 className="text-2xl font-bold text-center mb-6 mt-8">FORMULARIO PARA AGREGAR EVENTO</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                      <div>
                        <Label htmlFor="image">Imagen del evento</Label>
                        <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="bg-white"  />
                      </div>
                      <div>
                        <Label htmlFor="title">Nombre del evento</Label>
                        <Input id="title" name="title" value={newEvent.title} onChange={handleNewEventChange} className="bg-white" required />
                      </div>
                      <div>
                        <Label htmlFor="category">Categoría</Label>
                        <Select name="category" value={newEvent.category} onValueChange={(value) => setNewEvent(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.name} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="date">Fecha</Label>
                        <Input id="date" name="date" type="date" value={newEvent.date} onChange={handleNewEventChange} className="bg-white" required />
                      </div>
                      <div>
                        <Label htmlFor="time">Hora</Label>
                        <Input id="time" name="time" type="time" value={newEvent.time} onChange={handleNewEventChange} className="bg-white" required />
                      </div>
                      <div>
                        <Label htmlFor="location">Lugar</Label>
                        <Input id="location" name="location" value={newEvent.location} onChange={handleNewEventChange} className="bg-white" required />
                      </div>
                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" name="description" value={newEvent.description} onChange={handleNewEventChange} className="bg-white" required />
                      </div>
                      <div className="flex justify-center">
                        <Button type="submit">Enviar</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <div className="p-4">
                  <p>Por favor, inicia sesión para agregar un evento.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {selectedCategory && (
          <div className="space-y-4">
            <div className="flex justify-center items-center space-x-4">
              <Button variant="outline" size="icon" onClick={handleBackToCategories} className="bg-teal-500 hover:bg-teal-600 text-white">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Select value={selectedCategory} onValueChange={handleCategoryClick}>
                <SelectTrigger className="w-[40%]">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold mb-4">Eventos de {selectedCategory}</h2>
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex-grow cursor-pointer" onClick={() => openEventDetails(event)}>
                      <h3 className="font-semibold">{event.title}</h3>
                      <div className="flex items-center mt-1 text-sm">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {formatDate(event.date)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(event.id)
                      }}
                      disabled={!isAuthenticated}
                    >
                      <Heart className={`h-6 w-6 ${event.isSaved ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                      <span className="sr-only">{event.isSaved ? 'Quitar de favoritos' : 'Agregar a favoritos'}</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {selectedCategory && (
          <div className="flex justify-center mt-4">
            <Button onClick={handleBackToCategories} className="bg-teal-500 hover:bg-teal-600 text-white">
              Volver
            </Button>
          </div>
        )}
      </main>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="mt-2">
              <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full object-contain max-h-[60vh] rounded-md mb-4" />
              <p className="text-sm text-muted-foreground mb-2">{selectedEvent.category}</p>
              <div className="flex items-center mb-2 text-sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {formatDate(selectedEvent.date)}
              </div>
              <div className="flex items-center mb-2 text-sm">
                <Clock className="h-4 w-4 mr-2" />
                {selectedEvent.time}
              </div>
              <div className="flex items-center mb-4 text-sm">
                <MapPin className="h-4 w-4 mr-2" />
                {selectedEvent.location}
              </div>
              <DialogDescription>
                {selectedEvent.description.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">
                    {line.replace(/:\)/g, '😊').replace(/:\(/g, '😢').replace(/<3/g, '❤️')}
                  </p>
                ))}
              </DialogDescription>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar sesión</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input id="email" placeholder="Correo electrónico" />
            <Input id="password" type="password" placeholder="Contraseña" />
            {loginError && <p className="text-red-500">{loginError}</p>}
            <Button onClick={handleLogin}>Iniciar sesión</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}