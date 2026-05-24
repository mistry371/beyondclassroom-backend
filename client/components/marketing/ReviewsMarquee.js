'use client'

import { Star, Quote } from 'lucide-react'
import { reviews } from '@/data/marketingContent'

export default function ReviewsMarquee() {
  const doubled = [...reviews, ...reviews]

  return (
    <div className="relative overflow-hidden py-4">
      <div className="flex animate-marquee gap-6 w-max">
        {doubled.map((review, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[340px] bg-white rounded-2xl p-6 shadow-premium border border-primary/5"
          >
            <Quote className="h-8 w-8 text-secondary/40 mb-3" />
            <p className="text-ink text-sm leading-relaxed mb-4">&ldquo;{review.text}&rdquo;</p>
            <div className="flex gap-1 mb-3">
              {[...Array(review.rating)].map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-accent text-accent" />
              ))}
            </div>
            <p className="font-bold text-ink">{review.name}</p>
            <p className="text-muted text-sm">{review.role}</p>
            <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary font-medium">
              {review.package}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
