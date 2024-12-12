'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, Heart } from "lucide-react"
import { Event, formatDate } from "./types"

interface EventsProps {
  events: Event[]
  isAuthenticated: boolean
  showSavedOnly: boolean
  onEventClick: (event: Event) => void
  onToggleFavorite: (eventId: number) => void
  onShowAllEvents: () => void
  getNearbyEvents: () => void
  nearbyEvents: Event[]
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [latestEvents, setLatestEvents] = useState<Event[]>([])
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<number[]>([])
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]) // Estado para eventos cercanos

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/eventos')
      const data = await response.json()
      const allEvents = data.map((event: Event) => ({ ...event, isSaved: false }))
      
      // Ordenar por fecha del evento en orden descendente
      const sortedEvents = allEvents.sort((a: Event, b: Event) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return dateB - dateA
      })
      
      setEvents(sortedEvents)
      
      // Obtener los 5 eventos más recientes
      setLatestEvents(sortedEvents.slice(0, 5))
      setIsLoading(false)

      return sortedEvents
    } catch (error) {
      console.error('Error cargando eventos:', error)
      setIsLoading(false)
      return []
    }
  }

  const loadFavorites = async (token: string, currentEvents: Event[]) => {
    try {
      const response = await fetch('/api/favoritos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const favoriteIds = data.map((fav: any) => fav.id)
        setFavorites(favoriteIds)
        
        const updatedEvents = currentEvents.map(event => ({
          ...event,
          isSaved: favoriteIds.includes(event.id)
        }))
        
        setEvents(updatedEvents)
        setLatestEvents(updatedEvents.slice(0, 5))
        
        // Actualizar también los eventos cercanos con el estado de favoritos
        setNearbyEvents(prevNearby => 
          prevNearby.map(event => ({
            ...event,
            isSaved: favoriteIds.includes(event.id)
          }))
        )
        
        return updatedEvents
      }
      return currentEvents
    } catch (error) {
      console.error('Error al cargar favoritos:', error)
      return currentEvents
    }
  }

  const toggleFavorite = async (eventId: number, token: string | null) => {
    if (!token) return false

    try {
      const method = favorites.includes(eventId) ? 'DELETE' : 'POST'
      const response = await fetch('/api/favoritos', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ evento_id: eventId })
      })

      if (response.ok || response.status === 409) { 
        if (method === 'DELETE') {
          setFavorites(prev => prev.filter(id => id !== eventId))
        } else {
          setFavorites(prev => [...prev, eventId])
        }
        
        // Actualizar eventos normales
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === eventId
              ? { ...event, isSaved: !event.isSaved }
              : event
          )
        )

        // Actualizar eventos recientes
        setLatestEvents(prevLatest => 
          prevLatest.map(event =>
            event.id === eventId
              ? { ...event, isSaved: !event.isSaved }
              : event
          )
        )

        // Actualizar eventos cercanos
        setNearbyEvents(prevNearby =>
          prevNearby.map(event =>
            event.id === eventId
              ? { ...event, isSaved: !event.isSaved }
              : event
          )
        )

        return true
      }
      return false
    } catch (error) {
      console.error('Error al actualizar favorito:', error)
      return false
    }
  }

  const getNearbyEvents = async () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por tu navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch('/api/eventos/cercanos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ latitude, longitude }),
        });
        const data = await response.json();
        // Asignar el estado de favoritos actual a los eventos cercanos
        const eventsWithFavorites = data.map((event: Event) => ({
          ...event,
          isSaved: favorites.includes(event.id)
        }));
        setNearbyEvents(eventsWithFavorites);
      } catch (error) {
        console.error('Error obteniendo eventos cercanos:', error);
        alert('Error al obtener eventos cercanos');
      }
    }, (error) => {
      console.error('Error obteniendo ubicación:', error);
      alert('Error al obtener tu ubicación');
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEventIndex((prevIndex) => (prevIndex + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const getVisibleEvents = () => {
    return latestEvents.slice(currentEventIndex, currentEventIndex + 3)
  }

  const toggleShowSavedOnly = () => {
    setShowSavedOnly(!showSavedOnly)
  }

  const handleShowAllEvents = () => {
    setShowSavedOnly(false)
  }

  return {
    events,
    latestEvents,
    isLoading,
    favorites,
    currentEventIndex,
    showSavedOnly,
    loadEvents,
    loadFavorites,
    toggleFavorite,
    getVisibleEvents,
    toggleShowSavedOnly,
    handleShowAllEvents,
    setEvents,
    setLatestEvents,
    nearbyEvents, // Estado para eventos cercanos
    getNearbyEvents, // Función para obtener la ubicación y eventos cercanos
  }
}

export function Events({ 
  events, 
  isAuthenticated, 
  showSavedOnly, 
  onEventClick, 
  onToggleFavorite,
  onShowAllEvents,
  getNearbyEvents,
  nearbyEvents
}: EventsProps) {
  const [showNearby, setShowNearby] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-center items-center mb-4">
        <div className="space-x-2">
          <Button 
            onClick={() => {
              setShowNearby(false);
              onShowAllEvents();
            }}
            className="bg-[#6366f1] hover:bg-[#4f46e5] text-white"
          >
            Todos los eventos
          </Button>
          <Button 
            onClick={() => {
              getNearbyEvents();
              setShowNearby(true);
            }}
            className="bg-[#6366f1] hover:bg-[#4f46e5] text-white"
          >
            Eventos cerca de mí
          </Button>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {showNearby ? (
          nearbyEvents.length > 0 ? (
            nearbyEvents.map((event) => (
              <Card 
                key={event.id} 
                className={`cursor-pointer hover:shadow-lg transition-shadow shadow-md ${
                  event.date < new Date().toISOString().split('T')[0] ? 'bg-red-200/70' : ''
                }`}
                onClick={() => onEventClick(event)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {event.image && (
                      <div className="flex-shrink-0 w-24 h-24">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          {event.distance && (
                            <p className="text-sm text-blue-600 mb-3 font-medium">
                              A {Math.round(event.distance * 10) / 10} km de distancia
                            </p>
                          )}
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-gray-500">{event.description}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            <span>{formatDate(event.date)} {event.time}</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            <p>{event.category}</p>
                            <p>{event.location}</p>
                          </div>
                        </div>
                        {isAuthenticated && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(event.id);
                            }}
                          >
                            <Heart
                              className={`w-4 h-4 ${event.isSaved ? "fill-red-500 text-red-500" : ""}`}
                            />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>Buscando eventos cercanos...</p>
          )
        ) : (
          events.map((event) => (
            <Card 
              key={event.id} 
              className={`cursor-pointer hover:shadow-lg transition-shadow shadow-md ${
                event.date < new Date().toISOString().split('T')[0] ? 'bg-red-200/70' : ''
              }`}
              onClick={() => onEventClick(event)}
            >
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex-grow cursor-pointer" onClick={() => onEventClick(event)}>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.category}</p>
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
                    onToggleFavorite(event.id)
                  }}
                  disabled={!isAuthenticated}
                >
                  <Heart className={`h-6 w-6 ${event.isSaved ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                  <span className="sr-only">{event.isSaved ? 'Quitar de favoritos' : 'Agregar a favoritos'}</span>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export function EventsByCategory({ 
  events, 
  isAuthenticated, 
  category, 
  onEventClick, 
  onToggleFavorite, 
  onBack 
}: {
  events: Event[]
  isAuthenticated: boolean
  category: string
  onEventClick: (event: Event) => void
  onToggleFavorite: (eventId: number) => void
  onBack: () => void
}) {
  const filteredEvents = events.filter(event => event.category === category)

  const isEventPassed = (date: string, time: string) => {
    const eventDate = new Date(`${date} ${time}`);
    const now = new Date();
    return eventDate < now;
  };

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4">Eventos de {category}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {filteredEvents.map((event) => (
          <Card 
            key={event.id} 
            className={`cursor-pointer hover:shadow-lg transition-shadow shadow-md ${
              isEventPassed(event.date, event.time) ? 'bg-red-200/70' : ''
            }`}
            onClick={() => onEventClick(event)}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                {event.image && (
                  <div className="flex-shrink-0 w-24 h-24">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.description}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        <span>{formatDate(event.date)} {event.time}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>{event.category}</p>
                        <p>{event.location}</p>
                      </div>
                    </div>
                    {isAuthenticated && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(event.id);
                        }}
                      >
                        <Heart
                          className={`w-4 h-4 ${event.isSaved ? "fill-red-500 text-red-500" : ""}`}
                        />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <Button onClick={onBack} className="bg-teal-500 hover:bg-teal-600 text-white">
          Volver
        </Button>
      </div>
    </div>
  )
}
