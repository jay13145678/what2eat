import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <Header />
      <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto md:px-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
