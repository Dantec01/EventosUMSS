'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CalendarIcon, Clock, MapPin } from "lucide-react"
import { Event, formatDate } from "./types"

interface EventDetailsProps {
  event: Event | null
  onClose: () => void
}

export function EventDetails({ event, onClose }: EventDetailsProps) {
  if (!event) return null

  return (
    <Dialog open={!!event} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <img src={event.image} alt={event.title} className="w-full object-contain max-h-[60vh] rounded-md mb-4" />
          <p className="text-sm text-muted-foreground mb-2">{event.category}</p>
          <div className="flex items-center mb-2 text-sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center mb-2 text-sm">
            <Clock className="h-4 w-4 mr-2" />
            {event.time}
          </div>
          <div className="flex items-center mb-4 text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            {event.location}
          </div>
          <DialogDescription className="mb-4">
            Detalles del evento:
          </DialogDescription>
          <div className="space-y-2">
            {event.description.split('\n').map((line, index) => (
              <span key={index} className="block mb-2">
                {line.replace(/:\)/g, '😊').replace(/:\(/g, '😢').replace(/<3/g, '❤️')}
              </span>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
