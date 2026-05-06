import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useAppStore } from '@/store/useAppStore'
import { getDurationMultiplier } from '@/utils/animation'
import { QuizTab } from '../components/picker/QuizTab'
import { RandomTab } from '../components/picker/RandomTab'

type Tab = 'quiz' | 'random'

export default function PickerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('quiz')
  const contentRef = useRef<HTMLDivElement>(null)
  const animationDuration = useAppStore((s) => s.settings.animationDuration)

  useEffect(() => {
    if (!contentRef.current) return
    const durMul = getDurationMultiplier(animationDuration)
    const tween = gsap.fromTo(contentRef.current, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35 * durMul, ease: 'power2.out' })
    return () => { tween.kill() }
  }, [activeTab, animationDuration])

  return (
    <div className="flex-1 flex flex-col">
      {/* 标签栏 */}
      <div className="flex mx-4 mt-3 mb-2 border-[3px] border-ink">
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-3 text-sm font-bold tracking-wider transition-none ${
            activeTab === 'quiz'
              ? 'bg-ink text-white'
              : 'bg-white text-ink hover:bg-ink hover:text-white'
          }`}
        >
          问答推荐
        </button>
        <button
          onClick={() => setActiveTab('random')}
          className={`flex-1 py-3 text-sm font-bold tracking-wider transition-none ${
            activeTab === 'random'
              ? 'bg-ink text-white'
              : 'bg-white text-ink hover:bg-ink hover:text-white'
          }`}
        >
          直接随机
        </button>
      </div>

      {/* 内容区 */}
      <div ref={contentRef} className="flex-1 flex flex-col px-4 pb-4" style={{ willChange: 'transform, opacity' }}>
        {activeTab === 'quiz' ? <QuizTab /> : <RandomTab />}
      </div>
    </div>
  )
}
