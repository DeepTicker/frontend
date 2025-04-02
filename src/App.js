import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 페이지 컴포넌트
import MainPage from './pages/MainPage';
import NewsPage from './pages/NewsPage';
import StockPage from './pages/StockPage';
import ChatbotPage from './pages/ChatbotPage';
import StockDetail from "./pages/StockDetail";                                                                                   
import NewsDetailPage from './pages/NewsDetailPage';

// 네비게이션 바
import Navbar from './components/Navbar';

function App() {

  return (
    <Router>
      {/* 네비게이션 바는 항상 상단에 */}
      <Navbar />

      {/* 페이지별 라우팅 */}
      <div style={{ marginTop: 60 }}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/stocks" element={<StockPage />} />
          <Route path="/stocks/:name" element={<StockDetail />} /> 
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


