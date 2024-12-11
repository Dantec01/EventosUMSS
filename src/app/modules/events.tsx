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
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [latestEvents, setLatestEvents] = useState<Event[]>([])
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<number[]>([])
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/eventos')
      const data = await response.json()
      const allEvents = data.map((event: Event) => ({ ...event, isSaved: false }))
      
      // Ordenar por ID en orden descendente (los más recientes primero)
      const sortedEvents = allEvents.sort((a: Event, b: Event) => b.id - a.id)
      
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
        
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === eventId
              ? { ...event, isSaved: !event.isSaved }
              : event
          )
        )

        setLatestEvents(prevLatest => 
          prevLatest.map(event =>
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
    setLatestEvents
  }
}

export function Events({ 
  events, 
  isAuthenticated, 
  showSavedOnly, 
  onEventClick, 
  onToggleFavorite,
  onShowAllEvents 
}: EventsProps) {
  return (
    <div className="space-y-2 mt-4">
      {showSavedOnly && (
        <div className="flex justify-center mt-4 mb-4">
          <Button onClick={onShowAllEvents} className="bg-teal-500 hover:bg-teal-600 text-white">
            Mostrar todos los eventos
          </Button>
        </div>
      )}
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-md transition-shadow">
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
      ))}
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
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Eventos de {category}</h2>
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex-grow cursor-pointer" onClick={() => onEventClick(event)}>
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
                onToggleFavorite(event.id)
              }}
              disabled={!isAuthenticated}
            >
              <Heart className={`h-6 w-6 ${event.isSaved ? 'fill-current text-red-500' : 'text-gray-400'}`} />
              <span className="sr-only">{event.isSaved ? 'Quitar de favoritos' : 'Agregar a favoritos'}</span>
            </Button>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-center mt-4">
        <Button onClick={onBack} className="bg-teal-500 hover:bg-teal-600 text-white">
          Volver
        </Button>
      </div>
    </div>
  )
}
