import React, { useEffect, useState } from 'react';

const NewsPreview = () => {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    const fetchMainNews = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/news/main?limit=5");
        const data = await res.json();
        setNewsList(data);
      } catch (error) {
        console.error("❌ 메인 뉴스 불러오기 실패:", error);
      }
    };

    fetchMainNews();
  }, []);

  // Format date to YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.substring(0, 10);
  };

  return (
    <ul className="news-list">
      {newsList.map((news) => (
        <li key={news.id} className="news-item">
          <h4 className="news-title">{news.title}</h4>
          <div className="news-meta">
            <div className="news-meta-left">
              <span className="news-category">{news.category}</span>
              <span>{news.representative || ''}</span>
            </div>
            <div className="news-details">
              <span className="news-press">{news.press}</span>
              <span className="news-date">{formatDate(news.date)}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default NewsPreview;