import React from 'react';
import NewsPreview from '../components/NewsPreview';
import StockPreview from '../components/StockPreview';
import './MainPage.css';

const MainPage = () => {
  return (
    <div className="main-container">
      <div className="main-content">
        {/* 뉴스 섹션 */}
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">최근 뉴스</h2>
          </div>
          <div className="section-body">
            <NewsPreview />
          </div>
        </div>

        {/* 종목 섹션 */}
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">인기 종목</h2>
          </div>
          <div className="section-body">
            <StockPreview />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
