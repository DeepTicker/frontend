import React, { useEffect, useState } from 'react';

const NewsPreview = () => {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    const fetchMainNews = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/news/main?limit=5");
        const data = await res.json();
        setNewsList(data);
      } catch (error) {
        console.error("❌ 메인 뉴스 불러오기 실패:", error);
      }
    };

    fetchMainNews();
  }, []);

  return (
    <section style={{ marginBottom: '20px' }}>
      <h2>최근 뉴스</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {newsList.map((news) => (
          <li key={news.id} style={{ marginBottom: '12px' }}>
            <h4 style={{ margin: '0 0 4px 0', color: '#2F2F2F' }}>{news.title}</h4>
            <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>
              분류: {news.category} | 대표: {news.representative || '없음'}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default NewsPreview;