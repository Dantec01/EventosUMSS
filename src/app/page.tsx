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
import { Search, Calendar as CalendarIcon, Clock, MapPin, LogIn, Heart } from "lucide-react"
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

  const categories: Category[] = [
    { name: "Música", image: "/images/placeholder.jpg" },
    { name: "Cursos", image: "/images/placeholder.jpg?height=200&width=300" },
    { name: "Deportes", image: "/images/placeholder.jpg?height=200&width=300" },
    { name: "Charlas", image: "/images/placeholder.jpg?height=200&width=300" },
    { name: "Talleres", image: "/images/placeholder.jpg?height=200&width=300" },
    { name: "Otros", image: "/images/placeholder.jpg?height=200&width=300" },
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
    setEvents(events.map(event => 
      event.id === id ? { ...event, isSaved: !event.isSaved } : event
    ))
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
    setActiveTab("events")
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando eventos...</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-gradient-to-r from-red-500 to-blue-500 border-b border-border">
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
          <Button size="icon" variant={showSavedOnly ? "default" : "outline"} onClick={toggleShowSavedOnly}>
            <Heart className={`h-4 w-4 ${showSavedOnly ? 'fill-current' : ''}`} />
            <span className="sr-only">Mostrar favoritos</span>
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="categories" className="flex-grow">Categorías</TabsTrigger>
            <TabsTrigger value="events" className="flex-grow">Eventos</TabsTrigger>
            <TabsTrigger value="calendar" className="flex-grow">Calendario</TabsTrigger>
            <TabsTrigger value="add" className="flex-grow">Agregar</TabsTrigger>
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
            <div className="space-y-4 mt-4">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-grow cursor-pointer" onClick={() => openEventDetails(event)}>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.category}</p>
                      <div className="flex items-center mt-2 text-sm">
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
            <div className="flex justify-center items-center h-full">
              <Card className="w-full max-w-md">
                <CardContent className="p-0 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="add">
            <Card className="bg-gray-100">
              <CardContent>
                <h2 className="text-2xl font-bold text-center mb-6 mt-8">FORMULARIO PARA AGREGAR EVENTO</h2>
                <form onSubmit={handleSubmitNewEvent} className="space-y-4">
                  <div>
                    <Label htmlFor="image">Imagen del evento</Label>
                    <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} />
                  </div>
                  <div>
                    <Label htmlFor="title">Nombre del evento</Label>
                    <Input id="title" name="title" value={newEvent.title} onChange={handleNewEventChange} required />
                  </div>
                  <div>
                    <Label htmlFor="date">Fecha</Label>
                    <Input id="date" name="date" type="date" value={newEvent.date} onChange={handleNewEventChange} required />
                  </div>
                  <div>
                    <Label htmlFor="time">Hora</Label>
                    <Input id="time" name="time" type="time" value={newEvent.time} onChange={handleNewEventChange} required />
                  </div>
                  <div>
                    <Label htmlFor="location">Lugar</Label>
                    <Input id="location" name="location" value={newEvent.location} onChange={handleNewEventChange} required />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" name="description" value={newEvent.description} onChange={handleNewEventChange} required />
                  </div>
                  <div className="flex justify-center">
                    <Button type="submit">Enviar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-3xl">
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
                {selectedEvent.description}
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