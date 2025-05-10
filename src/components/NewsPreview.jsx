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

  return (
    <ul className="news-list">
      {newsList.map((news) => (
        <li key={news.id} className="news-item">
          <h4 className="news-title">{news.title}</h4>
          <div className="news-meta">
            <span className="news-category">{news.category}</span>
            <span>대표: {news.representative || '없음'}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default NewsPreview;