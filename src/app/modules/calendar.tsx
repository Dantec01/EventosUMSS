'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Event } from "./types"

interface CalendarProps {
  date: Date | undefined
  events: Event[]
  currentMonthEvents: Event[]
  onDateSelect: (date: Date | undefined) => void
  onMonthChange: (date: Date) => void
  onEventClick: (event: Event) => void
}

export function useCalendar(events: Event[]) {
  const [currentMonthEvents, setCurrentMonthEvents] = useState<Event[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())

  const getSavedEventDates = () => {
    return events
      .filter(event => event.isSaved)
      .map(event => new Date(event.date))
  }

  const getEventsForSelectedDate = (selectedDate: Date | undefined, eventsList = events) => {
    if (!eventsList) return []
    if (!selectedDate) return eventsList.filter(event => event.isSaved)
    
    const selectedMonth = selectedDate.getMonth()
    const selectedYear = selectedDate.getFullYear()
    const selectedDay = selectedDate.getDate()
    
    return eventsList.filter(event => {
      const eventDate = new Date(event.date)
      if (eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear) {
        if (selectedDay === eventDate.getDate() || selectedDate.getDate() === 1) {
          return event.isSaved
        }
      }
      return false
    })
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    setCurrentMonthEvents(getEventsForSelectedDate(newDate, events))
  }

  const handleMonthChange = (newMonth: Date) => {
    const firstDayOfMonth = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1)
    setDate(undefined)
    setCurrentMonthEvents(getEventsForSelectedDate(firstDayOfMonth, events))
  }

  return {
    date,
    currentMonthEvents,
    getSavedEventDates,
    getEventsForSelectedDate,
    handleDateSelect,
    handleMonthChange
  }
}

export function Calendar({ 
  date, 
  events, 
  currentMonthEvents,
  onDateSelect,
  onMonthChange,
  onEventClick
}: CalendarProps) {
  const { getSavedEventDates } = useCalendar(events)

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Card className="w-full md:w-1/2">
        <CardContent className="p-0 flex justify-center">
          <CalendarUI
            mode="single"
            selected={date}
            onSelect={onDateSelect}
            onMonthChange={onMonthChange}
            className="rounded-md border shadow"
            modifiers={{
              saved: getSavedEventDates(),
            }}
            modifiersStyles={{
              saved: { backgroundColor: 'rgba(239, 68, 68, 0.5)' },
            }}
            defaultMonth={new Date()}
            initialFocus
          />
        </CardContent>
      </Card>
      <Card className="w-full md:w-1/2">
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">
            {date
              ? `Eventos favoritos del ${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`
              : `Eventos favoritos del mes`}
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
                <Button variant="outline" size="sm" onClick={() => onEventClick(event)}>
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
  )
}
