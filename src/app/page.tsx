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

// Importa el archivo JSON desde src/lib/events.json
import eventsData from '@/lib/events.json'

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

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("categories")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    image: null as File | null,
  })
  const [events, setEvents] = useState<Event[]>([])
  const [latestEvents, setLatestEvents] = useState<Event[]>([])
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [currentMonthEvents, setCurrentMonthEvents] = useState<Event[]>([])

  useEffect(() => {
    //const fetchEvents = async () => {
      const loadEvents = () => {
      try {
        // const response = await fetch('./src/lib/events.json')
        // const data = await response.json()
        //const allEvents = data.events.map((event: Event) => ({ ...event, isSaved: false }))
        const allEvents = eventsData.events.map((event: Event) => ({ ...event, isSaved: false }))
        setEvents(allEvents.sort((a: Event, b: Event) => new Date(b.date).getTime() - new Date(a.date).getTime()))
        setLatestEvents(allEvents.slice(-5).reverse())
        setIsLoading(false)
      } catch (error) {
        console.error('Error cargando eventos:', error)
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEventIndex((prevIndex) => (prevIndex + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setCurrentMonthEvents(getEventsForSelectedDate(date))
    console.log('Actualizando eventos del mes:', date, events.filter(e => e.isSaved).length)
  }, [date, events])

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewEvent(prev => ({ ...prev, image: file }))
    }
  }

  const handleSubmitNewEvent = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Nuevo evento a enviar:", newEvent)
    alert("Evento enviado al administrador para revisión.")
    setNewEvent({
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      image: null,
    })
    setActiveTab("categories")
  }

  const toggleSaveEvent = (id: number) => {
    setEvents(prevEvents => {
      const updatedEvents = prevEvents.map(event => 
        event.id === id ? { ...event, isSaved: !event.isSaved } : event
      )
      setCurrentMonthEvents(getEventsForSelectedDate(date, updatedEvents))
      return updatedEvents
    })
  }

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
    if (!selectedDate) return []
    const selectedMonth = selectedDate.getMonth()
    const selectedYear = selectedDate.getFullYear()
    const selectedDay = selectedDate.getDate()
    return eventsList.filter(event => {
      const eventDate = new Date(event.date)
      if (selectedDate.getHours() === 0 && selectedDate.getMinutes() === 0) {
        // Si es una fecha seleccionada del calendario (sin hora específica)
        return eventDate.getMonth() === selectedMonth && 
               eventDate.getFullYear() === selectedYear && 
               eventDate.getDate() === selectedDay &&
               event.isSaved
      } else {
        // Si es el mes actual (fecha con hora)
        return eventDate.getMonth() === selectedMonth && 
               eventDate.getFullYear() === selectedYear && 
               event.isSaved
      }
    })
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      // Establecer la hora a medianoche para diferenciar entre selección de día y mes
      newDate.setHours(0, 0, 0, 0)
    }
    setDate(newDate)
    setCurrentMonthEvents(getEventsForSelectedDate(newDate))
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
          <Button size="sm" variant="ghost" className="bg-green-400 hover:bg-green-500" onClick={() => setIsLoginOpen(true)}>
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
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
              <TabsTrigger value="calendar" className="flex-grow text-white">Calendario</TabsTrigger>
              <TabsTrigger value="add" className="flex-grow text-white">Agregar</TabsTrigger>
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
                            {event.date}
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
                          {event.date}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-4"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSaveEvent(event.id)
                        }}
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
              <div className="flex flex-col md:flex-row gap-4">
                <Card className="w-full md:w-1/2">
                  <CardContent className="p-0 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      className="rounded-md border shadow"
                      modifiers={{
                        saved: getSavedEventDates(),
                      }}
                      modifiersStyles={{
                        saved: { backgroundColor: 'rgba(239, 68, 68, 0.5)' },
                      }}
                      defaultMonth={date}
                    />
                  </CardContent>
                </Card>
                <Card className="w-full md:w-1/2">
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-4">
                      {date && date.getHours() === 0
                        ? `Eventos favoritos del ${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`
                        : `Eventos favoritos de ${date?.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`}
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
            </TabsContent>
            <TabsContent value="add">
              <Card className="bg-gray-200">
                <CardContent>
                  <h2 className="text-2xl font-bold text-center mb-6 mt-8">FORMULARIO PARA AGREGAR EVENTO</h2>
                  <form onSubmit={handleSubmitNewEvent} className="space-y-4">
                    <div>
                      <Label htmlFor="image">Imagen del evento</Label>
                      <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="bg-white"  />
                    </div>
                    <div>
                      <Label htmlFor="title">Nombre del evento</Label>
                      <Input id="title" name="title" value={newEvent.title} onChange={handleNewEventChange} className="bg-white" required />
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
                        {event.date}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSaveEvent(event.id)
                      }}
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
                {selectedEvent.date}
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
            <Button>Iniciar sesión</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}