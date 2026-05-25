export default function ToolPanelSkeleton() {
  return (
    <div className="bg-dark-100/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 min-h-[320px] animate-pulse">
      <div className="h-8 bg-white/10 rounded-lg w-1/3 mb-6" />
      <div className="space-y-4">
        <div className="h-12 bg-white/5 rounded-xl" />
        <div className="h-12 bg-white/5 rounded-xl" />
        <div className="h-32 bg-white/5 rounded-xl" />
      </div>
    </div>
  )
}
