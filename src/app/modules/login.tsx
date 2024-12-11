'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface LoginProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess: (token: string) => void
}

export interface AuthState {
  isAuthenticated: boolean
  token: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null
  })

  const login = async (token: string) => {
    localStorage.setItem('token', token)
    setAuthState({
      isAuthenticated: true,
      token
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setAuthState({
      isAuthenticated: false,
      token: null
    })
  }

  const checkAuth = () => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setAuthState({
        isAuthenticated: true,
        token: storedToken
      })
    }
  }

  return {
    ...authState,
    login,
    logout,
    checkAuth
  }
}

export function Login({ isOpen, onOpenChange, onLoginSuccess }: LoginProps) {
  const [loginError, setLoginError] = useState<string | null>(null)
  const { login } = useAuth()

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: (document.getElementById('email') as HTMLInputElement).value,
          password: (document.getElementById('password') as HTMLInputElement).value,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setLoginError(errorData.error)
        return
      }

      const data = await response.json()
      await login(data.token)
      onLoginSuccess(data.token)
      onOpenChange(false)
      setLoginError(null)
    } catch (error) {
      setLoginError('Error al iniciar sesión. Por favor, inténtelo de nuevo.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar sesión</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input id="email" placeholder="Correo electrónico" className="px-3" />
          <Input id="password" type="password" placeholder="Contraseña" className="px-3" />
          {loginError && <p className="text-red-500">{loginError}</p>}
          <Button onClick={handleLogin}>Iniciar sesión</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
