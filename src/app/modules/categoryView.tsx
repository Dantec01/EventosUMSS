'use client'

import { useState, useEffect } from 'react'
import { Categories, CategorySelector } from './categories'
import { EventsByCategory, useEvents } from './events'
import { Event, Category } from './types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EventDetails } from './eventDetails'

export function CategoryView({ 
  events,
  isAuthenticated,
  token,
  onToggleFavorite,
  recommendedEvents,
  getRecommendedEvents
}: {
  events: Event[]
  isAuthenticated: boolean
  token: string | null
  onToggleFavorite: (eventId: number) => void
  recommendedEvents: Event[]
  getRecommendedEvents: () => void
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null)
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const { nearbyEvents, getNearbyEvents } = useEvents()

  useEffect(() => {
    if (isAuthenticated) {
      getNearbyEvents()
      getRecommendedEvents()
    }
  }, [isAuthenticated])

  // Categorías predefinidas
  const categories: Category[] = [
    { name: "Música", image: "/images/musica.webp" },
    { name: "Cursos", image: "/images/cursos.jpg?height=200&width=300" },
    { name: "Deportes", image: "/images/deportes.jpg?height=200&width=300" },
    { name: "Charlas", image: "/images/charlas.png?height=200&width=300" },
    { name: "Talleres", image: "/images/talleres.jpg?height=200&width=300" },
    { name: "Otros", image: "/images/otros.jpg?height=200&width=300" },
  ]

  // Ubicaciones y intereses predefinidos
  const locations = [
    "UMSS Campus Central",
    "UMSS Facultad de Agronomía",
    "UMSS Facultad de Arquitectura",
    "UMSS Facultad de Derecho",
    "UMSS Facultad de Economía",
    "UMSS Facultad de Humanidades",
    "UMSS Facultad de Medicina",
    "UMSS Facultad de Odontología",
    "UMSS Facultad de Tecnología",
    "UMSS Facultad de Veterinaria",
    "UMSS Valle de Sacta"
  ]

  const interests = [
    "Arquitectura", "Arte y Cultura", "Ciencias", "Deportes",
    "Educación", "Emprendimiento", "Entretenimiento", "Gastronomía",
    "Ingeniería", "Innovación", "Investigación", "Literatura",
    "Medicina", "Medio Ambiente", "Música", "Otros", "Tecnología"
  ]

  // Actualizar eventos filtrados cuando cambien los eventos globales
  useEffect(() => {
    if (!selectedCategory && !selectedLocation && !selectedInterest) {
      setFilteredEvents(events)
    } else {
      // Actualizar el estado de favoritos en los eventos filtrados
      setFilteredEvents(prevFiltered => 
        prevFiltered.map(filteredEvent => ({
          ...filteredEvent,
          isSaved: events.find(e => e.id === filteredEvent.id)?.isSaved || false
        }))
      )
    }
  }, [events])

  useEffect(() => {
    loadFilteredEvents()
  }, [selectedCategory, selectedLocation, selectedInterest])

  const loadFilteredEvents = async () => {
    // Si no hay filtros activos, usar los eventos pasados como prop
    if (!selectedCategory && !selectedLocation && !selectedInterest) {
      setFilteredEvents(events)
      return
    }

    try {
      setIsLoading(true)
      let url = '/api/eventos/filtrar?'
      const params = new URLSearchParams()
      
      if (selectedCategory) {
        params.append('categoria', selectedCategory)
      }
      if (selectedLocation) {
        params.append('ubicacion', selectedLocation)
      }
      if (selectedInterest) {
        params.append('interes', selectedInterest)
      }
      
      url += params.toString()
      
      const response = await fetch(url)
      const data = await response.json()
      
      // Asignar el estado de favoritos actual a los eventos filtrados
      const eventsWithFavorites = data.map((event: Event) => ({
        ...event,
        isSaved: events.find(e => e.id === event.id)?.isSaved || false
      }))
      
      setFilteredEvents(eventsWithFavorites)
    } catch (error) {
      console.error('Error cargando eventos filtrados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handlers para la UI
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
  }

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location === selectedLocation ? null : location)
  }

  const handleInterestChange = (interest: string) => {
    setSelectedInterest(interest === selectedInterest ? null : interest)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSelectedLocation(null)
    setSelectedInterest(null)
    setFilteredEvents(events)
  }

  // Componente de Selectores
  const Filters = () => (
    <div className="bg-gray-100 shadow-md rounded-lg p-2 mb-2">
      <div className="flex flex-col md:flex-row gap-4 w-full justify-start">
        <div className="w-full md:w-[180px]">
          <Select value={selectedLocation || "all"} onValueChange={handleLocationChange}>
            <SelectTrigger className="w-full bg-white shadow-sm">
              <SelectValue placeholder="Seleccionar ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-[180px]">
          <Select value={selectedInterest || "all"} onValueChange={handleInterestChange}>
            <SelectTrigger className="w-full bg-white shadow-sm">
              <SelectValue placeholder="Seleccionar interés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los temas</SelectItem>
              {interests.map(interest => (
                <SelectItem key={interest} value={interest}>
                  {interest}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4">
      {selectedEvent ? (
        <EventDetails 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
        />
      ) : (
        <>
          {selectedCategory ? (
            <>
              <div className="flex flex-col gap-4">
                <CategorySelector
                  onBack={handleBackToCategories}
                />
                <Filters />
              </div>
              <EventsByCategory
                events={filteredEvents}
                isAuthenticated={isAuthenticated}
                category={selectedCategory}
                onEventClick={handleEventClick}
                onToggleFavorite={onToggleFavorite}
                onBack={handleBackToCategories}
              />
            </>
          ) : (
            <Categories
              categories={categories}
              latestEvents={events.slice(0, 5)}
              nearbyEvents={nearbyEvents}
              recommendedEvents={recommendedEvents}
              selectedCategory={selectedCategory}
              onCategoryClick={handleCategoryClick}
              onEventClick={(event) => setSelectedEvent(event)}
              onBackToCategories={handleBackToCategories}
            />
          )}
        </>
      )}
    </div>
  )
}
