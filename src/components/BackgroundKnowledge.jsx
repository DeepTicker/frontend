import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BackgroundKnowledge.css';

const BackgroundKnowledge = ({ background }) => {
  const navigate = useNavigate();

  // Handle navigation to stock page
  const navigateToStock = (stockName) => {
    navigate(`/stock/${encodeURIComponent(stockName)}`);
  };

  // Expose navigateToStock function to the window for the onClick handlers in HTML
  useEffect(() => {
    window.navigateToStock = navigateToStock;
    
    // Cleanup function to avoid memory leaks
    return () => {
      window.navigateToStock = undefined;
    };
  }, [navigateToStock]);

  if (!background || background.trim() === '') {
    return (
      <div className="background-knowledge-container">
        <p>배경지식 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="background-knowledge-container">
      <div dangerouslySetInnerHTML={{ __html: background }} />
    </div>
  );
};

export default BackgroundKnowledge; 