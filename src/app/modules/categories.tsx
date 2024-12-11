'use client'

import { Card, CardContent } from "@/components/ui/card"
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
  onBack
}: {
  onBack: () => void
}) {
  return (
    <Button 
      variant="outline" 
      onClick={onBack} 
      className="bg-teal-500 hover:bg-teal-600 text-white w-full md:w-[100px] flex items-center justify-center gap-2 mt-4 shadow-lg"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Volver</span>
    </Button>
  )
}
