import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <h2 className="loading-text">Checking session...</h2>
    </div>
  );
};

export default LoadingScreen;
