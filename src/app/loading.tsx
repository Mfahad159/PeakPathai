import React from 'react'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-[#050505]/80 backdrop-blur-md">
      <div className="relative flex flex-col items-center justify-center">
        {/* Animated Theme Bar (Left to Right / Right to Left) */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-12 w-48 overflow-hidden rounded-full bg-white/5 shadow-inner">
            <div className="h-full w-1/2 rounded-full bg-orange-500/30 blur-md animate-ping-pong" />
          </div>
        </div>

        {/* Pulsing PeakPath Text */}
        <h1 
          className="animate-fade-in-out text-3xl font-extrabold tracking-tight text-white drop-shadow-2xl" 
          style={{ fontFamily: 'Georgia, serif' }}
        >
          PeakPath<span className="text-orange-500">.</span>
        </h1>
      </div>
    </div>
  )
}
