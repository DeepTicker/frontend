import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-title" onClick={() => navigate('/')}>
        DeepTicker
      </div>

      <div className="navbar-buttons">
        <button onClick={() => navigate('/')}>Home</button>
        <button onClick={() => navigate('/news')}>News</button>
        <button onClick={() => navigate('/stocks')}>Stocks</button>
        {/* <button onClick={() => navigate('/chatbot')}>Chatbot</button> */}
      </div>
    </nav>
  );
};

export default Navbar;
