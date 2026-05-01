"use client"

import { useEffect } from 'react'

export default function Dashboard() {
  useEffect(() => {
    const logged = sessionStorage.getItem('is_logged_in')
    if (!logged) window.location.href = '/login'
  }, [])

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Sistema oServ em Next.js 🚀</p>
    </div>
  )
}
