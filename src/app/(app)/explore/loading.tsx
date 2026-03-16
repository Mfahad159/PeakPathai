export default function ExploreLoading() {
  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-10 px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        
        <div>
          <div className="h-9 w-64 bg-white/10 rounded mb-3 animate-pulse"></div>
          <div className="h-4 w-96 max-w-full bg-white/5 rounded animate-pulse"></div>
        </div>

        <div className="grid gap-4 mt-6 sm:grid-cols-2">
          {/* Inline Skeleton Card replica since exploring global opportunities */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card animate-pulse p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 bg-white/10 rounded"></div>
                  <div className="h-4 w-1/2 bg-white/5 rounded"></div>
                </div>
                <div className="h-8 w-8 bg-white/10 rounded-full ml-4"></div>
              </div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-24 bg-orange-500/10 rounded-full"></div>
                <div className="h-6 w-32 bg-white/5 rounded-full"></div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="h-4 w-full bg-white/5 rounded"></div>
                <div className="h-4 w-full bg-white/5 rounded"></div>
                <div className="h-4 w-4/5 bg-white/5 rounded"></div>
              </div>
              <div className="h-4 w-24 bg-orange-500/20 rounded"></div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
