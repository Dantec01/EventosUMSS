'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Event, formatDate } from "./types"
import { Button } from "@/components/ui/button"

interface CarouselProps {
  events: Event[]
  onEventClick: (event: Event) => void
}

export function useCarousel(events: Event[]) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setCurrentEventIndex((prevIndex) => (prevIndex + 1) % Math.max(1, events.length - 2))
    }, 5000)
    return () => clearInterval(timer)
  }, [events.length, isAutoPlaying])

  const nextSlide = () => {
    setIsAutoPlaying(false)
    setCurrentEventIndex((prevIndex) => (prevIndex + 1) % Math.max(1, events.length - 2))
  }

  const prevSlide = () => {
    setIsAutoPlaying(false)
    setCurrentEventIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, events.length - 3) : prevIndex - 1
    )
  }

  return {
    currentEventIndex,
    nextSlide,
    prevSlide
  }
}

export function EventCarousel({ events, onEventClick }: CarouselProps) {
  const { currentEventIndex, nextSlide, prevSlide } = useCarousel(events)

  if (!events.length) {
    return <div>No hay eventos recientes</div>
  }

  return (
    <section aria-label="Carrusel de eventos" className="mt-6 w-full px-4">
      <div className="relative -mx-4">
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentEventIndex * (100 / 3)}%)` }}
          >
            {events.map((event) => (
              <div 
                key={event.id} 
                className="min-w-[33.333%] px-2"
              >
                <Card 
                  className="overflow-hidden transition-all duration-500 ease-in-out cursor-pointer hover:shadow-lg h-[280px] rounded-lg"
                  onClick={() => onEventClick(event)}
                >
                  <CardContent className="p-0 relative h-full">
                    <img 
                      src={event.image || '/placeholder.jpg'} 
                      alt={event.title} 
                      className="w-full h-[200px] object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                      {event.distance && (
                        <p className="text-sm text-blue-300 mb-1">
                          A {Math.round(event.distance * 10) / 10} km de distancia
                        </p>
                      )}
                      <h3 className="font-semibold text-white text-lg">{event.title}</h3>
                      <p className="text-sm text-gray-200">{event.category}</p>
                      <div className="flex justify-between mt-2 text-sm text-gray-200">
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
              </div>
            ))}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
          onClick={prevSlide}
          disabled={currentEventIndex === 0}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
          onClick={nextSlide}
          disabled={currentEventIndex >= events.length - 3}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: Math.ceil(events.length / 3) }).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentEventIndex / 3 ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
