'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageCarouselProps {
  images: string[]
  alt: string
}

export default function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        No images
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={images[current]}
          alt={`${alt} - image ${current + 1}`}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/75 transition"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/75 transition"
          >
            ›
          </button>
          <div className="flex justify-center gap-1 mt-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition ${i === current ? 'bg-gray-800' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
