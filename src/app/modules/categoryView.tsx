'use client'

import { useState, useEffect } from 'react'
import { Categories, CategorySelector } from './categories'
import { EventsByCategory } from './events'
import { Event, Category } from './types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CategoryView({ 
  events,
  isAuthenticated,
  token,
  onToggleFavorite
}: {
  events: Event[]
  isAuthenticated: boolean
  token: string | null
  onToggleFavorite: (eventId: number) => void
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null)
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events)

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

  useEffect(() => {
    filterEvents()
  }, [selectedCategory, selectedLocation, selectedInterest, events])

  const filterEvents = () => {
    let filtered = [...events]
    
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory)
    }
    if (selectedLocation) {
      filtered = filtered.filter(event => event.location === selectedLocation)
    }
    if (selectedInterest) {
      filtered = filtered.filter(event => event.category === selectedInterest)
    }
    
    setFilteredEvents(filtered)
  }

  // Handlers para la UI
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
  }

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location === 'all' ? null : location)
  }

  const handleInterestChange = (interest: string) => {
    setSelectedInterest(interest === 'all' ? null : interest)
  }

  const handleEventClick = (event: Event) => {
    console.log('Evento seleccionado:', event)
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
          selectedCategory={selectedCategory}
          onCategoryClick={handleCategoryClick}
          onEventClick={handleEventClick}
          onBackToCategories={handleBackToCategories}
        />
      )}
    </div>
  )
}
