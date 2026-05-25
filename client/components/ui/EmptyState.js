import Link from 'next/link'

export default function EmptyState({ title, description, actionLabel, actionHref, icon: Icon }) {
  return (
    <div className="text-center py-16 px-6 glass-card rounded-2xl max-w-lg mx-auto">
      {Icon && <Icon className="h-12 w-12 text-primary/40 mx-auto mb-4" />}
      <h3 className="text-lg font-bold text-ink mb-2">{title}</h3>
      <p className="text-muted text-sm mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="inline-block px-6 py-3 bg-brand-gradient text-white rounded-xl font-semibold">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
