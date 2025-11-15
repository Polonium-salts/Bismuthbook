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
      {/* Responsive grid layout - 移动端2列，间距优化 */}
      <div 
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
        style={{ gridAutoRows: 'max-content' }}
      >
        {artworks.map((artwork) => (
          <div key={artwork.id} className="w-full h-full">
            <ImageCard
              image={artwork}
            />
          </div>
        ))}
      </div>
    </div>
  )
})

export { ArtworkGrid }