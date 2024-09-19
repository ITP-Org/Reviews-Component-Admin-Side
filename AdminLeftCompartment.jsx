import React, { useEffect, useState } from 'react';
import { FaTrashAlt, FaStar } from 'react-icons/fa';
import axios from 'axios';
import './AdminLeftCompartment.css';

const AdminLeftCompartment = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:3001/reviews');
        //console.log('Fetched reviews:', response.data); 
        const sortedReviews = response.data.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
        setReviews(sortedReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, [reviews]);

  // Function to delete a review
  const deleteReview = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this review?");
    
    if (confirmed) {
      try {
        await axios.delete(`http://localhost:3001/reviews/${id}`);
        const updatedReviews = reviews.filter(review => review._id !== id);
        setReviews(updatedReviews);
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    } else {
      console.log("Deletion canceled");
    }
  };
  

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar key={i} className={i <= rating ? 'star filled' : 'star'} />
      );
    }
    return stars;
  };

  return (
    <div className="admin-left-compartment">
      <div className="admin-left-compartment-inner">
        {reviews.map(review => (
          <div className="review-card" key={review._id}>
            <img 
              src={review.profilePicture} 
              alt={`${review.username}'s profile`} 
              className="profile-picture" 
            />
            <div className="review-details">
              <h4 className="username">{review.username}</h4>
              <div className="rating">{renderStars(review.rating)}</div>
              <p className="review-text">{review.reviewText}</p>
              <span className="published-date">{new Date(review.publishedDate).toLocaleDateString()}</span>
            </div>
            <FaTrashAlt
              className="delete-icon"
              style={{ color: '#744ecd' }}
              onClick={() => deleteReview(review._id)} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLeftCompartment;
