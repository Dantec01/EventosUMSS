'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Event, Category } from "./types"
import { EventCarousel } from "./carousel"

interface CategoriesProps {
  categories: Category[]
  latestEvents: Event[]
  nearbyEvents: Event[]
  recommendedEvents: Event[]
  selectedCategory: string | null
  onCategoryClick: (category: string) => void
  onEventClick: (event: Event) => void
  onBackToCategories: () => void
}

export function Categories({ 
  categories, 
  latestEvents,
  nearbyEvents,
  recommendedEvents,
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
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Últimos eventos</h2>
        <EventCarousel events={latestEvents} onEventClick={onEventClick} />
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Eventos más cercanos</h2>
        <EventCarousel events={nearbyEvents} onEventClick={onEventClick} />
      </div>
      {recommendedEvents.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Eventos recomendados</h2>
          <EventCarousel events={recommendedEvents} onEventClick={onEventClick} />
        </div>
      )}
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
