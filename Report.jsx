import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import axios from 'axios';
import './Report.css';

const Report = () => {
  const [ratingsData, setRatingsData] = useState([]);
  const [lowRatings, setLowRatings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ratingsResponse, lowRatingsResponse] = await Promise.all([
          axios.get('http://localhost:3001/review-aggregates'),
          axios.get('http://localhost:3001/low-ratings')
        ]);

        setRatingsData(ratingsResponse.data);
        setLowRatings(lowRatingsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const starRatings = ratingsData.map(item => item.starRating);
  const ratingCounts = ratingsData.map(item => item.count);

  const pieData = {
    labels: starRatings,
    datasets: [
      {
        data: ratingCounts,
        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0'],
      },
    ],
  };

  const barData = {
    labels: starRatings,
    datasets: [
      {
        label: 'Number of Ratings',
        data: ratingCounts,
        backgroundColor: '#744ecd',
      },
    ],
  };

  return (
    <div className="report-container">
      <h1 className="report-title">Review Report</h1>

      <h2 className="report-subtitle">Number of Ratings</h2>
      <table className="ratings-table">
        <thead>
          <tr>
            <th>Star Rating</th>
            <th>Number of Star Ratings</th>
          </tr>
        </thead>
        <tbody>
          {ratingsData.map((data, index) => (
            <tr key={index}>
              <td>{data.starRating}</td>
              <td>{data.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="charts">
        <div className="chart-container">
          <h2 className="chart-title">Pie Chart</h2>
          <Pie data={pieData} />
        </div>
        <div className="chart-container">
          <h2 className="chart-title">Bar Chart</h2>
          <Bar data={barData} />
        </div>
      </div>

      <h2 className="report-subtitle">Insights</h2>
      <ul className="insights-list">
        {lowRatings.map((item, index) => (
          <li key={index}>{item.username}: {item.rating} stars</li>
        ))}
      </ul>
    </div>
  );
};

export default Report;
