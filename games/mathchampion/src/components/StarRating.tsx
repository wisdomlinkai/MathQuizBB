import { Star } from 'lucide-react';

interface StarRatingProps {
  stars: number;
  size?: number;
  animate?: boolean;
}

export function StarRating({ stars, size = 32, animate = false }: StarRatingProps) {
  return (
    <div className="flex gap-1.5 items-center justify-center">
      {[1, 2, 3].map((n) => {
        const earned = n <= stars;
        return (
          <Star
            key={n}
            style={{ width: size, height: size }}
            className={`${
              earned ? 'text-sun-400 fill-sun-400' : 'text-gray-300 fill-gray-200'
            } ${animate && earned ? 'animate-star-pop' : ''}`}
          />
        );
      })}
    </div>
  );
}
