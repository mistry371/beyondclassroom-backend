export default function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      <p className="text-muted text-sm">{label}</p>
    </div>
  )
}
