import { useNavigate } from 'react-router-dom'

export function Header() {
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b-[3px] border-ink">
      <h1 className="text-base font-bold tracking-tighter">今天吃什么</h1>
      <button
        onClick={() => navigate('/settings')}
        className="text-xs font-semibold tracking-wider border-[3px] border-ink px-3 py-1 hover:bg-ink hover:text-white transition-none"
        aria-label="设置"
      >
        设置
      </button>
    </header>
  )
}
