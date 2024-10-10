import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import axios from 'axios';
import './Report.css';
import Logo from './assets/logo2.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import RFooter from './RFooter.jsx';

const Report = () => {
  const [ratingsData, setRatingsData] = useState([]);
  const [lowRatings, setLowRatings] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState('');

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

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US');
    const formattedTime = now.toLocaleTimeString('en-US');
    setCurrentDateTime(`${formattedDate} ${formattedTime}`);
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

  const handleDownload = () => {
    const doc = new jsPDF();
    const content = document.querySelector('.report-container');
    const downloadBtn = document.querySelector('.download-btn'); 
  
    downloadBtn.style.display = 'none';
  
    if (!content) {
      console.error('Error: .report-container element not found');
      return;
    }
  
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US');
    const formattedTime = now.toLocaleTimeString('en-US');
    const currentDateTime = `Report generated on: ${formattedDate} at ${formattedTime}`;
  
    html2canvas(content).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 20; 
  
      doc.text(currentDateTime, 10, 10);
  
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
  
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
  
      doc.save('report.pdf');
  
      downloadBtn.style.display = 'block';
    }).catch((error) => {
      console.error('Error generating PDF:', error);
  
      downloadBtn.style.display = 'block';
    });
  };

  const sortedRatings = lowRatings.reduce((acc, review) => {
    const rating = review.rating;
    if (!acc[rating]) {
      acc[rating] = [];
    }
    acc[rating].push(`${review.username} (${new Date(review.publishedDate).toLocaleDateString()})`);
    return acc;
  }, {});

  return (
    <div className="report-container">
      <div className="heading-content">
        <img src={Logo} alt="Logo-Chemistry with Saumika" />
        <h1 className="report-title">Review Report</h1>
      </div>
      <div className="button-div">
        <button className="download-btn" onClick={handleDownload}>Download</button>
      </div>
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
      <h2 className="report-subtitle">Insights</h2>
      <table className="insights-table">
        <thead>
          <tr>
            <th>1 Star Ratings</th>
            <th>2 Star Ratings</th>
            <th>3 Star Ratings</th>
          </tr>
        </thead>
        <tbody>
          {Math.max(
            (sortedRatings[1] ? sortedRatings[1].length : 0),
            (sortedRatings[2] ? sortedRatings[2].length : 0),
            (sortedRatings[3] ? sortedRatings[3].length : 0)
          ) > 0 && [...Array(Math.max(
            (sortedRatings[1] ? sortedRatings[1].length : 0),
            (sortedRatings[2] ? sortedRatings[2].length : 0),
            (sortedRatings[3] ? sortedRatings[3].length : 0)
          ))].map((_, rowIndex) => (
            <tr key={rowIndex}>
              <td>{sortedRatings[1] && sortedRatings[1][rowIndex] ? sortedRatings[1][rowIndex] : ''}</td>
              <td>{sortedRatings[2] && sortedRatings[2][rowIndex] ? sortedRatings[2][rowIndex] : ''}</td>
              <td>{sortedRatings[3] && sortedRatings[3][rowIndex] ? sortedRatings[3][rowIndex] : ''}</td>
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

      <p className="report-date">Report generated on: {currentDateTime}</p>
      <p className ="report-author">Report generated by: Admin</p>
      <RFooter className="report-footer"/>
    </div>
    
  );
};

export default Report;
