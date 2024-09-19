import React, { useState } from 'react';
import Report from './Report'; 
import './ViewReportButton.css';

const ViewReportButton = () => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  let modalContent = null;

  if (showModal) {
    modalContent = (
      <div className="modal">
        <div className="modal-content">
          <span className="close-button" onClick={closeModal}>&times;</span>
          <Report />
        </div>
      </div>
    );
  }

  return (
    <>
      <button className="view-report-button" onClick={openModal}>
        View Report
      </button>
      {modalContent}
    </>
  );
};

export default ViewReportButton;
