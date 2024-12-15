'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Heart } from "lucide-react"
import { Event } from './types'

interface SearchProps {
  searchTerm: string
  showSavedOnly: boolean
  isAuthenticated: boolean
  onSearch: (term: string) => void
  onToggleSaved: () => void
}

export function useSearch() {
  const filterEvents = (
    events: Event[],
    searchTerm: string,
    showSavedOnly: boolean,
    selectedCategory: string | null
  ) => {
    return events.filter(event => 
      (showSavedOnly ? event.isSaved : true) &&
      (selectedCategory ? event.category === selectedCategory : true) &&
      (event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.date.includes(searchTerm) ||
      event.time.includes(searchTerm))
    )
  }

  return { filterEvents }
}

export function SearchBar({ 
  searchTerm, 
  showSavedOnly, 
  isAuthenticated, 
  onSearch, 
  onToggleSaved 
}: SearchProps) {
  return (
    <div className="flex items-center space-x-2 p-4">
      <Input 
        type="search" 
        placeholder="Buscar eventos..." 
        className="flex-grow bg-white px-2" 
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
      <Button size="icon" onClick={() => onSearch(searchTerm)}>
        <Search className="h-4 w-4" />
        <span className="sr-only">Buscar</span>
      </Button>
      <Button 
        size="icon" 
        variant={showSavedOnly ? "default" : "outline"} 
        onClick={onToggleSaved}
        className={showSavedOnly ? "bg-red-500" : ""}
        disabled={!isAuthenticated}
      >
        <Heart className={`h-4 w-4 ${showSavedOnly ? 'fill-current' : ''}`} />
        <span className="sr-only">Mostrar favoritos</span>
      </Button>
    </div>
  )
}
