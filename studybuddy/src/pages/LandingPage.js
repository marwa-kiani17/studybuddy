import React from 'react';
import ParticlesComponent from '../components/ParticlesComponent';
import Banner from '../components/Banner';
import './LandingPage.css'; // Ensure you have this CSS for styling

const LandingPage = () => {
  return (
    <div className="landing-page">
      <ParticlesComponent id="particles-js" />
      <Banner />
    </div>
  );
};

export default LandingPage;