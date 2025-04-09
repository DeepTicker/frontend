import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const NewsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageSize = 20;
  const pageGroupSize = 5;

  const [currentPage, setCurrentPage] = useState(1);
  const [newsList, setNewsList] = useState([]);
  const [totalNews, setTotalNews] = useState(0);

  // ✅ 페이지 정보 URL에서 받아오기
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(pageFromUrl);
  }, [searchParams]);

  // ✅ API 호출
  useEffect(() => {
    const fetchNewsList = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/news/list?page=${currentPage}&size=${pageSize}`);
        const data = await res.json();
        
        // 데이터 구조에 맞게 상태 업데이트
        setNewsList(data.news); // 뉴스 목록
        setTotalNews(data.total); // 전체 뉴스 개수
      } catch (err) {
        console.error("❌ 뉴스 불러오기 실패:", err);
      }
    };
  
    fetchNewsList();
  }, [currentPage]);
  const totalPages = Math.ceil(totalNews / pageSize);
  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
    setSearchParams({ page: pageNum });
    window.scrollTo(0, 0);
  };

  return (
    <PageLayout>
      <h2 style={{ marginBottom: '16px', color: '#2F2F2F' }}>📰 뉴스 목록</h2>

      {newsList?.map((news) => (
        <div
          key={news.id}
          style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{ cursor: 'pointer', flex: 1 }}
              onClick={() => navigate(`/news/${news.id}`)}
            >
              <h4 style={{ margin: '0 0 6px 0', color: '#2F2F2F' }}>{news.title}</h4>
              <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>
                분류: {news.category} | 대표: {news.representative || '없음'}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* 페이지네이션 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '12px' }}>
        <button onClick={() => handlePageClick(1)} disabled={startPage === 1} style={navBtnStyle(startPage === 1)}>&laquo;</button>
        <button onClick={() => handlePageClick(startPage - 1)} disabled={startPage === 1} style={navBtnStyle(startPage === 1)}>&lt;</button>

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
          const pageNum = startPage + i;
          return (
            <button
              key={pageNum}
              onClick={() => handlePageClick(pageNum)}
              style={{
                ...pageBtnStyle,
                fontWeight: currentPage === pageNum ? 'bold' : 'normal',
                color: currentPage === pageNum ? 'orange' : '#444',
              }}
            >
              {pageNum}
            </button>
          );
        })}

        <button onClick={() => handlePageClick(endPage + 1)} disabled={endPage === totalPages} style={navBtnStyle(endPage === totalPages)}>&gt;</button>
        <button onClick={() => handlePageClick(totalPages)} disabled={endPage === totalPages} style={navBtnStyle(endPage === totalPages)}>&raquo;</button>
      </div>
    </PageLayout>
  );
};

const navBtnStyle = (disabled) => ({
  background: 'none',
  border: 'none',
  color: disabled ? '#ccc' : '#888',
  cursor: disabled ? 'default' : 'pointer',
  fontSize: '16px',
});

const pageBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
};

export default NewsPage;