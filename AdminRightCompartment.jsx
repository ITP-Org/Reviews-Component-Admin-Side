import React, { useState } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaStar } from 'react-icons/fa';
import './AdminRightCompartment.css';

const AdminRightCompartment = () => {
  const [filter, setFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [noReviews, setNoReviews] = useState(false);

  //function for search
  const handleSearch = async () => {
    try {
      let response;
      
      if (filter === 'username') {
        response = await axios.get('http://localhost:3001/reviews/filter/username', {
          params: { username: searchText }
        });
      } else if (filter === 'dateRange') {
        response = await axios.get('http://localhost:3001/reviews/filter/dateRange', {
          params: { startDate, endDate }
        });
      } 
  
      const reviews = response.data.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      
      if (reviews.length === 0) {
        setNoReviews(true);
        setErrorMessage('No reviews found');
      } else {
        setFilteredReviews(reviews);
        setNoReviews(false);
        setErrorMessage('');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setNoReviews(true);
          setErrorMessage('No reviews found');
        } else {
          setErrorMessage(`Error: ${error.response.data.error || 'Unknown error occurred'}`);
        }
      } else if (error.request) {
        setErrorMessage('Network error. Please try again later.');
      } else {
        setErrorMessage('Error setting up request: ' + error.message);
      }
    }
  };

  //function to handle trash can icon in each review
  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm("Are you sure you want to delete this review?");
    
    if (confirmed) {
      try {
        await axios.delete(`http://localhost:3001/reviews/${reviewId}`);
        const updatedReviews = filteredReviews.filter(review => review._id !== reviewId);
        setFilteredReviews(updatedReviews);
        if (updatedReviews.length === 0) {
          setNoReviews(true);
        }
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    } else {
      console.log("Deletion canceled");
    }
  };
  
  //function to clear search
  const handleClearSearch = () => {
    setFilteredReviews([]);
    setNoReviews(false);
    setSearchText('');
    setStartDate('');
    setEndDate('');
  };

  //function to delete all reviews
  const handleDeleteAll = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all reviews?");
    
    if (confirmed) {
      try {
        for (const review of filteredReviews) {
          await axios.delete(`http://localhost:3001/reviews/${review._id}`);
        }
        setFilteredReviews([]);
        setNoReviews(true);
      } catch (error) {
        console.error('Error deleting all filtered reviews:', error);
      }
    } else {
      console.log("Deletion of all reviews canceled");
    }
  };
  

  //function to render stars
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
    <div className="admin-right-compartment">
      <div className="filter-options">
        <label>
          <input
            type="radio"
            name="filter"
            value="username"
            checked={filter === 'username'}
            onChange={() => setFilter('username')}
          />
          Username
        </label>
        <label>
          <input
            type="radio"
            name="filter"
            value="dateRange"
            checked={filter === 'dateRange'}
            onChange={() => setFilter('dateRange')}
          />
          Date Range
        </label>
      </div>
      <div className="search-area">
        {filter === 'username' ? (
          <>
            <input
              type="text"
              placeholder="Enter username"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="search-field"
            />
            <button className="search-button" onClick={handleSearch}>Search</button>
          </>
        ) : (
          <>
            <input
              type="date"
              className="date-field"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <input
              type="date"
              className="date-field"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              placeholder="End Date"
            />
            <button className="search-button" onClick={handleSearch}>Search</button>
          </>
        )}
      </div>
      <div className="filtered-reviews">
      <div className = "filtered-reviews-content">
        {noReviews ? (
          <p className="no-reviews-message">No reviews found</p>
        ) : (
          filteredReviews.map(review => (
            <div className="review-card" key={review._id}>
              <img
                src={review.profilePicture}
                alt={`${review.username}'s profile`}
                className="profile-picture"
              />
              <div className="review-details">
                <h4 className="username">{review.username}</h4>
                <div className="rating">
                  {renderStars(review.rating)}
                </div>
                <p className="review-text">{review.reviewText}</p>
                <span className="published-date">
                  {new Date(review.publishedDate).toLocaleDateString()}
                </span>
              </div>
              <FaTrashAlt
                className="delete-icon"
                onClick={() => handleDelete(review._id)}
              />
            </div>
          ))
        )} 
      </div>
      </div>
      <div className="action-buttons">
        <button className="action-button" onClick={handleClearSearch}>Clear Search</button>
        <button className="action-button" onClick={handleDeleteAll}>Delete All</button>
      </div>
    </div>
  );
};

export default AdminRightCompartment;
