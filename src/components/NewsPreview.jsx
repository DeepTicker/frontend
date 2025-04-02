import React from 'react';
import mockData from '../mockData/newsMockData.json';

const NewsPreview = () => {
  const newsList = mockData.news_raw;
  // newsList의 마지막 5개를 추출하고, 최신 기사가 맨 위에 오도록 역순 정렬
  const recentNews = newsList.slice(-5).reverse();

  return (
    <section style={{ marginBottom: '20px' }}>
      <h2>최근 뉴스</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {recentNews.map((news) => (
          <li key={news.news_id} style={{ marginBottom: '12px' }}>
            <h4 style={{ margin: '0 0 4px 0', color: '#2F2F2F' }}>{news.title}</h4>
            <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>
              {news.content.substring(0, 50)}...
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default NewsPreview;