'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Category, NewEvent } from './types'

interface EventFormProps {
  isAuthenticated: boolean
  categories: Category[]
  interests: { id: number, nombre: string }[]
  onEventCreated: (event: any) => void
}

export function useEventForm(onEventCreated: (event: any) => void) {
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: '',
    category: '',
    tema_id: 0,
    date: '',
    time: '',
    location: '',
    description: '',
    image: null
  })

  const handleNewEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewEvent(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewEvent({...newEvent, image: e.target.files[0]})
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar campos
    if (!newEvent.title || !newEvent.category || !newEvent.tema_id || !newEvent.date || 
        !newEvent.time || !newEvent.location || !newEvent.description || !newEvent.image) {
      alert('Por favor, complete todos los campos')
      return
    }

    const formData = new FormData()
    formData.append('title', newEvent.title)
    formData.append('category', newEvent.category)
    formData.append('tema_id', newEvent.tema_id.toString())
    formData.append('date', newEvent.date)
    formData.append('time', newEvent.time)
    formData.append('location', newEvent.location)
    formData.append('description', newEvent.description)
    formData.append('image', newEvent.image)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear evento')
      }

      const createdEvent = await response.json()
      onEventCreated(createdEvent)
      
      // Resetear formulario
      setNewEvent({
        title: '',
        category: '',
        tema_id: 0,
        date: '',
        time: '',
        location: '',
        description: '',
        image: null
      })

      alert('Evento creado exitosamente')
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  return {
    newEvent,
    handleNewEventChange,
    handleImageChange,
    handleCreate,
    setNewEvent
  }
}

export function EventForm({ isAuthenticated, categories, interests, onEventCreated }: EventFormProps) {
  const {
    newEvent,
    handleNewEventChange,
    handleImageChange,
    handleCreate,
    setNewEvent
  } = useEventForm(onEventCreated)

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <p>Por favor, inicia sesión para agregar un evento.</p>
      </div>
    )
  }

  return (
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
              <SelectTrigger className="w-full bg-white">
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
            <Label htmlFor="tema">Tema</Label>
            <Select name="tema" value={newEvent.tema_id.toString()} onValueChange={(value) => setNewEvent(prev => ({ ...prev, tema_id: parseInt(value) }))}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Selecciona un tema" />
              </SelectTrigger>
              <SelectContent>
                {interests.map((interest) => (
                  <SelectItem key={interest.id} value={interest.id.toString()}>
                    {interest.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input id="date" name="date" type="date" value={newEvent.date} onChange={handleNewEventChange} className="bg-white px-3 py-2" required />
          </div>
          <div>
            <Label htmlFor="time">Hora</Label>
            <Input id="time" name="time" type="time" value={newEvent.time} onChange={handleNewEventChange} className="bg-white px-3 py-2" required />
          </div>
          <div>
            <Label htmlFor="location">Lugar</Label>
            <Input id="location" name="location" value={newEvent.location} onChange={handleNewEventChange} className="bg-white px-3 py-2" required />
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
  )
}
