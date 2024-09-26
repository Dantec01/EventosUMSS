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
import { Search, Calendar as CalendarIcon, Clock, MapPin, LogIn, X, Plus, Upload, Heart } from "lucide-react"

interface Event {
  id: number
  title: string
  category: string
  date: string
  time: string
  location: string
  description: string
  image: string
  userDescription?: string
  isSaved?: boolean
}

interface Category {
  name: string
  image: string
}

export default function EventosUMSS() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
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
  const [events, setEvents] = useState<Event[]>([
    { id: 1, title: "Concierto de Rock", category: "Música", date: "2023-09-15", time: "20:00", location: "Estadio Central", description: "Un increíble concierto de rock con las mejores bandas locales.", image: "/placeholder.svg?height=400&width=600", isSaved: false },
    { id: 2, title: "Exposición de Arte Moderno", category: "Arte", date: "2023-09-20", time: "10:00", location: "Galería de Arte Municipal", description: "Descubre las últimas tendencias en arte moderno de artistas emergentes.", image: "/placeholder.svg?height=400&width=600", isSaved: false },
    { id: 3, title: "Maratón de la Ciudad", category: "Deportes", date: "2023-09-25", time: "07:00", location: "Parque Central", description: "Participa en la maratón anual de la ciudad. ¡Corre por una buena causa!", image: "/placeholder.svg?height=400&width=600", isSaved: false },
    { id: 4, title: "Conferencia de IA", category: "Tecnología", date: "2023-09-30", time: "14:00", location: "Centro de Convenciones", description: "Expertos en IA discuten los últimos avances y sus implicaciones futuras.", image: "/placeholder.svg?height=400&width=600", isSaved: false },
    { id: 5, title: "Festival Gastronómico", category: "Gastronomía", date: "2023-10-05", time: "12:00", location: "Plaza Mayor", description: "Degusta platos de todo el mundo en nuestro festival gastronómico anual.", image: "/placeholder.svg?height=400&width=600", isSaved: false },
    { id: 6, title: "Estreno de Película", category: "Cine", date: "2023-10-10", time: "19:00", location: "Cine Metropolis", description: "Asiste al estreno de la película más esperada del año.", image: "/placeholder.svg?height=400&width=600", isSaved: false },
  ])

  const categories: Category[] = [
    { name: "Música", image: "/placeholder.svg?height=200&width=300" },
    { name: "Arte", image: "/placeholder.svg?height=200&width=300" },
    { name: "Deportes", image: "/placeholder.svg?height=200&width=300" },
    { name: "Tecnología", image: "/placeholder.svg?height=200&width=300" },
    { name: "Gastronomía", image: "/placeholder.svg?height=200&width=300" },
    { name: "Cine", image: "/placeholder.svg?height=200&width=300" },
  ]

  const latestEvents = [
    { id: 7, title: "Concierto de Jazz", category: "Música", date: "2023-10-15", time: "21:00", location: "Club de Jazz Blue Note", description: "Una noche de jazz suave con artistas internacionales.", image: "/placeholder.svg?height=400&width=600" },
    { id: 8, title: "Exposición de Fotografía", category: "Arte", date: "2023-10-20", time: "11:00", location: "Museo de la Fotografía", description: "Explora el mundo a través de los ojos de fotógrafos talentosos.", image: "/placeholder.svg?height=400&width=600" },
    { id: 9, title: "Torneo de Tenis", category: "Deportes", date: "2023-10-25", time: "09:00", location: "Club de Tenis Municipal", description: "Ven a ver a los mejores tenistas locales competir por el título.", image: "/placeholder.svg?height=400&width=600" },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEventIndex((prevIndex) => (prevIndex + 1) % latestEvents.length)
    }, 5000) // Cambia cada 5 segundos

    return () => clearInterval(timer)
  }, [])

  const getVisibleEvents = () => {
    const events = []
    for (let i = 0; i < 3; i++) {
      const index = (currentEventIndex + i) % latestEvents.length
      events.push(latestEvents[index])
    }
    return events
  }

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event)
  }

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.date.includes(searchTerm) ||
    event.time.includes(searchTerm)
  )

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setActiveTab("events")
  }

  const updateEventDescription = (description: string) => {
    if (selectedEvent) {
      setSelectedEvent({...selectedEvent, userDescription: description})
    }
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
    // Aquí simularíamos el envío del formulario al correo del administrador
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d1/UMSS.png" alt="UMSS Logo" className="w-6 h-8" />
            <span className="text-lg font-semibold">Eventos UMSS</span>
          </div>
          <Button size="sm" variant="ghost" className="bg-green-400 hover:bg-green-600" onClick={() => setIsLoginOpen(true)}>
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        </div>
        <div className="flex items-center space-x-2 p-4">
          <Input 
            type="search" 
            placeholder="Buscar eventos..." 
            className="flex-grow" 
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button size="icon">
            <Search className="h-4 w-4" />
            <span className="sr-only">Buscar</span>
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
                  onClick={() => setSelectedCategory(category.name)}
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
            <Card>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border shadow"
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="add">
            <Card>
              <CardContent>
                <h2 className="text-2xl font-bold text-center mb-6 mt-10">FORMULARIO PARA AGREGAR EVENTO</h2>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="mt-2">
              <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-48 object-cover rounded-md mb-4" />
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
              <Textarea
                className="mt-4"
                placeholder="Añade tu descripción (máximo 1000 caracteres)"
                value={selectedEvent.userDescription || ""}
                onChange={(e) => updateEventDescription(e.target.value)}
                maxLength={1000}
              />
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