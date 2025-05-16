import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import './NewsPage.css';

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
    console.log('페이지 파라미터 감지:', { pageFromUrl, searchParams: Object.fromEntries([...searchParams]) });
    setCurrentPage(pageFromUrl);
  }, [searchParams]);

  // ✅ API 호출
  useEffect(() => {
    const fetchNewsList = async () => {
      try {
        const res = await fetch(`http://localhost:10000/api/news/list?page=${currentPage}&size=${pageSize}`);
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
      <div className="news-page-container">
        <h2 className="news-page-title">DeepTicker News Digest</h2>

        {newsList?.map((news) => (
          <div key={news.id} className="news-item">
            <div className="news-item-content">
              <div
                className="news-item-info"
                onClick={() => {
                  console.log('뉴스 클릭:', { newsId: news.id, currentPage });
                  // localStorage에도 현재 페이지 저장
                  localStorage.setItem('newsListPage', currentPage);
                  navigate(`/news/${news.id}`, { 
                    state: { 
                      fromPage: currentPage
                    } 
                  });
                }}
              >
                <h4 className="news-item-title">{news.title}</h4>
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
                    <span className="news-date">{new Date(news.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 페이지네이션 */}
        <div className="pagination">
          <button 
            onClick={() => handlePageClick(1)} 
            disabled={startPage === 1} 
            className="nav-button"
          >
            &laquo;
          </button>
          <button 
            onClick={() => handlePageClick(startPage - 1)} 
            disabled={startPage === 1} 
            className="nav-button"
          >
            &lt;
          </button>

          {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
            const pageNum = startPage + i;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                className={`page-button ${currentPage === pageNum ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            );
          })}

          <button 
            onClick={() => handlePageClick(endPage + 1)} 
            disabled={endPage === totalPages} 
            className="nav-button"
          >
            &gt;
          </button>
          <button 
            onClick={() => handlePageClick(totalPages)} 
            disabled={endPage === totalPages}
            className="nav-button" 
          >
            &raquo;
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default NewsPage;