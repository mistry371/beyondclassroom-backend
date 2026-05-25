import ToolPanelSkeleton from '@/components/ui/ToolPanelSkeleton'
import PageLoader from '@/components/ui/PageLoader'

export default function ToolsLoading() {
  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <PageLoader label="Loading math tools..." />
        <div className="mt-8 grid lg:grid-cols-4 gap-6">
          <div className="hidden lg:block h-96 bg-white/5 rounded-2xl animate-pulse" />
          <div className="lg:col-span-3">
            <ToolPanelSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
