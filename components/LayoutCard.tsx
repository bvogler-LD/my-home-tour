'use client'

import ImageCarousel from './ImageCarousel'
import { Layout } from '@/types'

interface LayoutCardProps {
  layout: Layout
  selected: boolean
  onSelect: () => void
}

export default function LayoutCard({ layout, selected, onSelect }: LayoutCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border-2 cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
          : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      <ImageCarousel images={layout.image_urls} alt={layout.name} />
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
              selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
            }`}
          >
            {selected && (
              <svg viewBox="0 0 20 20" fill="white" className="w-full h-full p-0.5">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <h3 className="font-semibold text-gray-900">{layout.name}</h3>
        </div>
        {layout.description && (
          <p className="mt-1 text-sm text-gray-500 ml-7">{layout.description}</p>
        )}
      </div>
    </div>
  )
}
