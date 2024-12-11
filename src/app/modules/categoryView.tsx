'use client'

import { useState, useEffect } from 'react'
import { Categories, CategorySelector } from './categories'
import { EventsByCategory } from './events'
import { Event, Category } from './types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CategoryView() {
  // Estado local del componente
  const [events, setEvents] = useState<Event[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([]) // Guardamos todos los eventos sin filtrar
  const [latestEvents, setLatestEvents] = useState<Event[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<number[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)

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

  // Cargar eventos y verificar autenticación al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
      await loadEvents()
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        setToken(storedToken)
        setIsAuthenticated(true)
        await loadFavorites(storedToken)
      }
    }
    loadInitialData()
  }, [])

  // Cargar eventos desde la API con filtros
  const loadEvents = async () => {
    try {
      setIsLoading(true)
      
      if (!selectedCategory && !selectedLocation && !selectedInterest) {
        // Si no hay filtros activos y ya tenemos los eventos, los usamos
        if (allEvents.length > 0) {
          setEvents(allEvents)
          setLatestEvents(allEvents.slice(0, 5))
          setIsLoading(false)
          return
        }
        
        // Si no tenemos eventos, hacemos la llamada inicial
        const response = await fetch('/api/eventos')
        const data = await response.json()
        const eventsWithFavorites = data.map((event: Event) => ({
          ...event,
          isSaved: favorites.includes(event.id)
        }))
        
        setAllEvents(eventsWithFavorites)
        setEvents(eventsWithFavorites)
        setLatestEvents(eventsWithFavorites.slice(0, 5))
        setIsLoading(false)
        return
      }
      
      // Si hay filtros activos, hacemos la llamada con filtros
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
      
      const eventsWithFavorites = data.map((event: Event) => ({
        ...event,
        isSaved: favorites.includes(event.id)
      }))
      
      setEvents(eventsWithFavorites)
      setIsLoading(false)
    } catch (error) {
      console.error('Error cargando eventos:', error)
      setIsLoading(false)
    }
  }

  // Efecto para cargar eventos cuando cambian los filtros
  useEffect(() => {
    loadEvents()
  }, [selectedCategory, selectedLocation, selectedInterest])

  // Cargar favoritos del usuario
  const loadFavorites = async (token: string) => {
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
        
        setEvents(prevEvents => prevEvents.map(event => ({
          ...event,
          isSaved: favoriteIds.includes(event.id)
        })))
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error)
    }
  }

  // Manejar toggle de favoritos
  const handleToggleFavorite = async (eventId: number) => {
    if (!token) return

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
        const newFavorites = method === 'DELETE' 
          ? favorites.filter(id => id !== eventId)
          : [...favorites, eventId]
        
        setFavorites(newFavorites)
        
        setEvents(prevEvents => prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, isSaved: !event.isSaved }
            : event
        ))
        
        setLatestEvents(prevEvents => prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, isSaved: !event.isSaved }
            : event
        ))
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error)
    }
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
    // Usamos los eventos guardados en lugar de hacer una nueva llamada
    setEvents(allEvents)
    setLatestEvents(allEvents.slice(0, 5))
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

  if (isLoading) {
    return <div>Cargando...</div>
  }

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
            events={events}
            isAuthenticated={isAuthenticated}
            category={selectedCategory}
            onEventClick={handleEventClick}
            onToggleFavorite={handleToggleFavorite}
            onBack={handleBackToCategories}
          />
        </>
      ) : (
        <Categories
          categories={categories}
          latestEvents={latestEvents}
          selectedCategory={selectedCategory}
          onCategoryClick={handleCategoryClick}
          onEventClick={handleEventClick}
          onBackToCategories={handleBackToCategories}
        />
      )}
    </div>
  )
}
