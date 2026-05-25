export default function CourseCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-primary/10 rounded w-1/3 mb-4" />
      <div className="h-6 bg-primary/10 rounded w-3/4 mb-3" />
      <div className="h-4 bg-primary/5 rounded w-full mb-2" />
      <div className="h-4 bg-primary/5 rounded w-5/6 mb-6" />
      <div className="h-10 bg-primary/10 rounded-xl" />
    </div>
  )
}
