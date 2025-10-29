"use client"

import { memo } from "react"
import { ImageCard } from "@/components/image/image-card"
import { cn } from "@/lib/utils"
import { ImageWithUserAndStats } from "@/lib/types/database"

interface ArtworkGridProps {
  artworks: ImageWithUserAndStats[]
  className?: string
}

const ArtworkGrid = memo(function ArtworkGrid({ artworks, className }: ArtworkGridProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Responsive grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {artworks.map((artwork) => (
          <ImageCard
            key={artwork.id}
            image={artwork}
          />
        ))}
      </div>
    </div>
  )
})

export { ArtworkGrid }