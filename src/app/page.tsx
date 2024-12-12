'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogIn } from "lucide-react"

// Importar componentes modulares
import { Event, Category } from './modules/types'
import { Login } from './modules/login'
import { SearchBar } from './modules/search'
import { EventDetails } from './modules/eventDetails'
import { Events, EventsByCategory, useEvents } from './modules/events'
import { Calendar, useCalendar } from './modules/calendar'
import { CategoryView } from './modules/categoryView'
import { EventForm } from './modules/eventForm'

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("categories")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const {
    events,
    latestEvents,
    isLoading,
    currentEventIndex,
    showSavedOnly,
    loadEvents,
    loadFavorites,
    toggleFavorite,
    getVisibleEvents,
    toggleShowSavedOnly,
    handleShowAllEvents,
    setEvents,
    nearbyEvents,
    getNearbyEvents
  } = useEvents()

  const {
    date,
    currentMonthEvents,
    handleDateSelect,
    handleMonthChange
  } = useCalendar(events)

  useEffect(() => {
    const loadInitialData = async () => {
      const loadedEvents = await loadEvents()
      if (isAuthenticated && token) {
        await loadFavorites(token, loadedEvents)
      }
    }
    loadInitialData()
  }, [isAuthenticated, token])

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)
    }
  }, [])

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

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando eventos...</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className={`sticky top-0 z-10 bg-gradient-to-r from-red-500 to-blue-500 border-b border-border rounded-b-lg transition-all duration-400 ease-in-out ${activeTab === 'add' ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d1/UMSS.png" alt="UMSS Logo" className="w-6 h-8" />
            <span className="text-lg font-semibold text-white">Eventos UMSS</span>
          </div>
          {isAuthenticated ? (
            <Button size="sm" className="hover:bg-red-500" onClick={() => {
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
        <SearchBar 
          searchTerm={searchTerm}
          showSavedOnly={showSavedOnly}
          isAuthenticated={isAuthenticated}
          onSearch={handleSearch}
          onToggleSaved={() => {
            toggleShowSavedOnly()
            setActiveTab("events")
          }}
        />
      </header>

      <main className={`p-4 space-y-6 bg-gray-100 transition-all duration-300 ease-in-out ${activeTab === 'add' ? '-mt-4' : ''}`}>
        {!selectedCategory && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-red-500 to-blue-500">
              <TabsTrigger value="categories" className="flex-grow text-white">Categorías</TabsTrigger>
              <TabsTrigger value="events" className="flex-grow text-white">Eventos</TabsTrigger>
              <TabsTrigger value="calendar" className={`flex-grow text-white ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isAuthenticated}>Calendario</TabsTrigger>
              <TabsTrigger value="add" className={`flex-grow text-white ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isAuthenticated}>Agregar</TabsTrigger>
            </TabsList>
            <TabsContent value="categories">
              <CategoryView 
                events={events}
                isAuthenticated={isAuthenticated}
                token={token}
                onToggleFavorite={(eventId) => toggleFavorite(eventId, token)}
              />
            </TabsContent>
            <TabsContent value="events">
              <Events 
                events={filteredEvents}
                isAuthenticated={isAuthenticated}
                showSavedOnly={showSavedOnly}
                onEventClick={openEventDetails}
                onToggleFavorite={(eventId) => toggleFavorite(eventId, token)}
                onShowAllEvents={handleShowAllEvents}
                getNearbyEvents={getNearbyEvents}
                nearbyEvents={nearbyEvents}
              />
            </TabsContent>
            <TabsContent value="calendar">
              {isAuthenticated ? (
                <Calendar 
                  date={date}
                  events={events}
                  currentMonthEvents={currentMonthEvents}
                  onDateSelect={handleDateSelect}
                  onMonthChange={handleMonthChange}
                  onEventClick={openEventDetails}
                />
              ) : (
                <div className="p-4">
                  <p>Por favor, inicia sesión para ver el calendario.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="add">
              <EventForm 
                isAuthenticated={isAuthenticated}
                categories={categories}
                onEventCreated={(event) => setEvents([event, ...events])}
              />
            </TabsContent>
          </Tabs>
        )}
        
        {selectedCategory && (
          <>
            <EventsByCategory 
              events={filteredEvents}
              isAuthenticated={isAuthenticated}
              category={selectedCategory}
              onEventClick={openEventDetails}
              onToggleFavorite={(eventId) => toggleFavorite(eventId, token)}
              onBack={handleBackToCategories}
            />
          </>
        )}
      </main>

      <EventDetails 
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      <Login 
        isOpen={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onLoginSuccess={(token) => {
          setIsAuthenticated(true)
          setToken(token)
        }}
      />
    </div>
  )
}