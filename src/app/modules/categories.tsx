'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CalendarIcon, Clock } from "lucide-react"
import { Event, Category, formatDate } from "./types"

interface CategoriesProps {
  categories: Category[]
  latestEvents: Event[]
  selectedCategory: string | null
  onCategoryClick: (category: string) => void
  onEventClick: (event: Event) => void
  onBackToCategories: () => void
}

export function Categories({ 
  categories, 
  latestEvents,
  selectedCategory,
  onCategoryClick, 
  onEventClick,
  onBackToCategories
}: CategoriesProps) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {categories.map((category) => (
          <Card 
            key={category.name} 
            className="cursor-pointer overflow-hidden"
            onClick={() => onCategoryClick(category.name)}
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
          {latestEvents.map((event) => (
            <Card 
              key={event.id} 
              className="overflow-hidden transition-all duration-500 ease-in-out cursor-pointer hover:shadow-lg"
              onClick={() => onEventClick(event)}
            >
              <CardContent className="p-0 relative h-48">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 p-4 flex flex-col justify-end">
                  <h3 className="font-semibold text-white">{event.title}</h3>
                  <p className="text-sm text-gray-200">{event.category}</p>
                  <div className="flex flex-col gap-1 mt-2 text-sm text-gray-200">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{event.time.slice(0, 5)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  )
}

export function CategorySelector({
  categories,
  selectedCategory,
  onCategoryClick,
  onBack
}: {
  categories: Category[]
  selectedCategory: string | null
  onCategoryClick: (category: string) => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <Button 
        variant="outline" 
        onClick={onBack} 
        className="bg-teal-500 hover:bg-teal-600 text-white w-full md:w-[100px] flex items-center justify-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver</span>
      </Button>
      
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <Select>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Seleccionar ubicación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UMSS Campus Central">UMSS Campus Central</SelectItem>
            <SelectItem value="UMSS Facultad de Agronomía">UMSS Facultad de Agronomía</SelectItem>
            <SelectItem value="UMSS Facultad de Arquitectura">UMSS Facultad de Arquitectura</SelectItem>
            <SelectItem value="UMSS Facultad de Derecho">UMSS Facultad de Derecho</SelectItem>
            <SelectItem value="UMSS Facultad de Economía">UMSS Facultad de Economía</SelectItem>
            <SelectItem value="UMSS Facultad de Humanidades">UMSS Facultad de Humanidades</SelectItem>
            <SelectItem value="UMSS Facultad de Medicina">UMSS Facultad de Medicina</SelectItem>
            <SelectItem value="UMSS Facultad de Odontología">UMSS Facultad de Odontología</SelectItem>
            <SelectItem value="UMSS Facultad de Tecnología">UMSS Facultad de Tecnología</SelectItem>
            <SelectItem value="UMSS Facultad de Veterinaria">UMSS Facultad de Veterinaria</SelectItem>
            <SelectItem value="UMSS Valle de Sacta">UMSS Valle de Sacta</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Seleccionar interés" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arquitectura">Arquitectura</SelectItem>
            <SelectItem value="Arte y Cultura">Arte y Cultura</SelectItem>
            <SelectItem value="Ciencias">Ciencias</SelectItem>
            <SelectItem value="Deportes">Deportes</SelectItem>
            <SelectItem value="Educación">Educación</SelectItem>
            <SelectItem value="Emprendimiento">Emprendimiento</SelectItem>
            <SelectItem value="Entretenimiento">Entretenimiento</SelectItem>
            <SelectItem value="Gastronomía">Gastronomía</SelectItem>
            <SelectItem value="Ingeniería">Ingeniería</SelectItem>
            <SelectItem value="Innovación">Innovación</SelectItem>
            <SelectItem value="Investigación">Investigación</SelectItem>
            <SelectItem value="Literatura">Literatura</SelectItem>
            <SelectItem value="Medicina">Medicina</SelectItem>
            <SelectItem value="Medio Ambiente">Medio Ambiente</SelectItem>
            <SelectItem value="Música">Música</SelectItem>
            <SelectItem value="Otros">Otros</SelectItem>
            <SelectItem value="Tecnología">Tecnología</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
