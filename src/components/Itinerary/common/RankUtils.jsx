import { Star } from 'lucide-react';

// Helper function to convert rankOverall to a star rating (out of 5)
export const getStarRating = (rank) => {
  if (!rank && rank !== 0) return 0;
  return (rank / 100) * 5; // Convert percentage to a 5-star scale
};

// Helper function to get a descriptive label for the rank
export const getRankLabel = (rank) => {
  if (!rank && rank !== 0) return 'Not Rated';
  if (rank >= 0 && rank <= 25) return 'Poor';
  if (rank > 25 && rank <= 50) return 'Fair';
  if (rank > 50 && rank <= 75) return 'Good';
  if (rank > 75 && rank <= 100) return 'Excellent';
  return 'Not Rated';
};

// Helper function to get rank color class based on rankOverall value
export const getRankColorClass = (rank) => {
  if (!rank && rank !== 0) return 'bg-gray-300';
  if (rank >= 0 && rank <= 25) return 'bg-red-500';
  if (rank > 25 && rank <= 50) return 'bg-yellow-500';
  if (rank > 50 && rank <= 75) return 'bg-green-300';
  if (rank > 75 && rank <= 100) return 'bg-green-500';
  return 'bg-gray-300';
};

// Component to render star rating
export const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={14}
          className={`${
            index < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-xs text-gray-600 ml-1">({rating.toFixed(1)} / 5)</span>
    </div>
  );
};