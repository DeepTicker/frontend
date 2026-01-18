import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 페이지 컴포넌트
// import MainPage from './pages/MainPage2';
import NewsPage from './pages/NewsPage';
import StockPage from './pages/StockPage';
import ChatbotPage from './pages/ChatbotPage';
import StockDetail from "./pages/StockDetail";                                                                                   
import NewsDetailPage from './pages/NewsDetailPage';
import MainPage2 from './pages/MainPage2';

// 네비게이션 바
import Navbar from './components/Navbar';

function App() {

  return (
    <Router>
      {/* 네비게이션 바는 항상 상단에 */}
      <Navbar />

      {/* 페이지별 라우팅 */}
      <div style ={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<MainPage2 />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/stocks" element={<StockPage />} />
          <Route path="/stocks/:id" element={<StockDetail />} /> 
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


