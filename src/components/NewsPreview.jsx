import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewsPreview.css';

const NewsPreview = () => {
  const [newsList, setNewsList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMainNews = async () => {
      try {
        const res = await fetch("https://frontend-tau-virid-25.vercel.app/api/news/main?limit=5");
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

  const handleNewsClick = (newsId) => {
    navigate(`/news/${newsId}`);
  };

  return (
    <ul className="news-list">
      {newsList?.map((news) => (
        <li 
          key={news.id} 
          className="news-item"
          onClick={() => handleNewsClick(news.id)}
          style={{ cursor: 'pointer' }}
        >
          <h4 className="news-title">{news.title}</h4>
          <div className="news-meta">
            <div className="news-meta-left">
              {news.classifications.map((classification, index) => (
                <React.Fragment key={index}>
                  <span className="news-category">{classification.category}</span>
                  {classification.representative && (
                    <span className="news-representative">
                      {classification.representative}
                    </span>
                  )}
                  {index < news.classifications.length - 1 && (
                    <span className="news-separator">|</span>
                  )}
                </React.Fragment>
              ))}
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