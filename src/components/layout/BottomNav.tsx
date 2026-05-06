import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/', label: '选菜' },
  { path: '/settings', label: '设置' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="flex items-stretch bg-white border-t-[3px] border-ink pb-[calc(env(safe-area-inset-bottom))]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex-1 py-3 text-xs font-bold tracking-widest transition-none ${
              isActive
                ? 'bg-ink text-white'
                : 'bg-white text-ink hover:bg-ink hover:text-white'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
