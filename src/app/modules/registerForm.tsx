import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RegisterFormProps {
  isAuthenticated: boolean
  interests: { id: number, nombre: string }[]
  onRegisterSuccess: () => void
}

export function RegisterForm({ isAuthenticated, interests, onRegisterSuccess }: RegisterFormProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    tema1: '',
    tema2: '',
    tema3: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que los temas sean diferentes
    const temas = [formData.tema1, formData.tema2, formData.tema3]
    if (new Set(temas).size !== 3) {
      alert('Por favor, selecciona 3 temas diferentes')
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Usuario registrado exitosamente')
        setOpen(false)
        onRegisterSuccess()
      } else {
        const error = await response.json()
        alert(error.message || 'Error al registrar usuario')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al registrar usuario')
    }
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="ghost" 
          className="bg-blue-400 hover:bg-blue-500"
        >
          Registrarse
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registro de Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label>Temas de interés (selecciona 3 diferentes)</Label>
            <div className="space-y-2">
              <Select
                value={formData.tema1}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tema1: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el primer tema" />
                </SelectTrigger>
                <SelectContent>
                  {interests.map((interest) => (
                    <SelectItem key={interest.id} value={interest.id.toString()}>
                      {interest.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.tema2}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tema2: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el segundo tema" />
                </SelectTrigger>
                <SelectContent>
                  {interests.map((interest) => (
                    <SelectItem key={interest.id} value={interest.id.toString()}>
                      {interest.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.tema3}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tema3: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tercer tema" />
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
          </div>
          <Button type="submit" className="w-full">Registrarse</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
