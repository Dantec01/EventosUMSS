'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Event, Category } from "./types"

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
  selectedCategory: string
  onCategoryClick: (category: string) => void
  onBack: () => void
}) {
  return (
    <div className="flex justify-center items-center space-x-4">
      <Button variant="outline" size="icon" onClick={onBack} className="bg-teal-500 hover:bg-teal-600 text-white">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Select value={selectedCategory} onValueChange={onCategoryClick}>
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
  )
}
