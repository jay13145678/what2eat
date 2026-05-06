import type { Icon } from '@phosphor-icons/react'

interface EmptyStateProps {
  icon: Icon
  title: string
  description?: string
}

export function EmptyState({ icon: IconComp, title, description }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16">
      <IconComp size={32} weight="thin" className="mb-4" />
      <p className="text-ink font-medium text-sm tracking-wider">{title}</p>
      {description && (
        <p className="text-ink/50 text-xs tracking-wider mt-1">{description}</p>
      )}
    </div>
  )
}
