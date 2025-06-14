import React, { useEffect } from 'react';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';

const ReviewList = ({ reviews }) => {
  // Log when the component renders
  useEffect(() => {
    console.log('ReviewList component rendered with reviews:', reviews);
  }, [reviews]);

  // Function to blur names if needed
  const displayName = (review) => {
    if (review.blur) {
      return <div className="bg-gray-200 h-6 w-28 rounded"></div>;
    }
    return review.name || review.userName || 'Name';
  };

  // Ensure reviews is an array
  const reviewsArray = Array.isArray(reviews) ? reviews : [];
  
  console.log('ReviewList rendering with', reviewsArray.length, 'reviews');

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 md:mb-8">
      {reviewsArray && reviewsArray.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {reviewsArray.map((review, index) => (
            <div key={review.id || index} className="bg-white rounded-lg shadow-sm p-4 border border-blue-100 hover:border-blue-300 transition-colors">
              {/* Rating */}
              <div className="flex items-center mb-3">
                <div className="flex">
                  <i className={`pi ${review.rating >= 1 ? 'pi-star-fill text-yellow-500' : 'pi-star text-gray-300'} mr-1`}></i>
                  <i className={`pi ${review.rating >= 2 ? 'pi-star-fill text-yellow-500' : 'pi-star text-gray-300'} mr-1`}></i>
                  <i className={`pi ${review.rating >= 3 ? 'pi-star-fill text-yellow-500' : 'pi-star text-gray-300'} mr-1`}></i>
                  <i className={`pi ${review.rating >= 4 ? 'pi-star-fill text-yellow-500' : 'pi-star text-gray-300'} mr-1`}></i>
                  <i className={`pi ${review.rating >= 5 ? 'pi-star-fill text-yellow-500' : 'pi-star text-gray-300'}`}></i>
                </div>
                <span className="text-gray-500 ml-2 text-sm">{review.rating || 2.5} Stars</span>
              </div>
              
              {/* Reviewer Info */}
              <div className="mb-3">
                <h3 className="text-lg md:text-xl font-medium text-gray-800">
                  {displayName(review)}
                </h3>
                {review.role && (
                  <Tag 
                    value={review.role} 
                    className="mt-1 bg-blue-100 text-blue-800 px-2 py-1 text-xs"
                  />
                )}
              </div>
              
              {/* Review Text */}
              <p className="text-gray-600 text-sm md:text-base">
                {review.feedback || review.text || review.comment || 'Review text'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-500">No reviews available</p>
        </div>
      )}
    </div>
  );
};

export default ReviewList; 