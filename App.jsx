import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AdminLeftCompartment from './AdminLeftCompartment';
import AdminRightCompartment from './AdminRightCompartment';
import ViewReportButton from './ViewReportButton';
import './App.css';
import NavBar from './navBar';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <NavBar></NavBar>
        </header>
        <main className="main-content">
          <h1 className="title">Manage Reviews</h1>
          <div className="admin-compartments">
            <AdminLeftCompartment />
            <AdminRightCompartment />
          </div>
          <ViewReportButton />
        </main>
      </div>
    </Router>
  );
};

export default App;
