export interface Event {
  id: number
  title: string
  category: string
  date: string
  time: string
  location: string
  description: string
  image: string
  isSaved?: boolean
  distance?: number
}

export interface Category {
  name: string
  image: string
}

export interface NewEvent {
  title: string
  category: string
  tema_id: number
  date: string
  time: string
  location: string
  description: string
  image: File | null
}

export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('es-ES', options)
}
