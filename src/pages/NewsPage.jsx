import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import mockNewsData from '../mockData/newsMockData.json'; //임시데이터!

const NewsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // mockNewsData는 JSON 배열 형태로 저장됨
  const totalNews = mockNewsData.news_raw;

  // 페이지네이션 설정
  const pageSize = 20;       // 한 페이지당 20개 뉴스
  const pageGroupSize = 5;   // 페이지 번호 5개씩 슬라이딩
  const totalPages = Math.ceil(totalNews.length / pageSize);

  // URL에서 현재 페이지 번호를 가져오기 (기본은 1)
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  // 현재 페이지에 해당하는 뉴스 목록 추출
  const startIdx = (currentPage - 1) * pageSize;
  const currentNews = totalNews.slice(startIdx, startIdx + pageSize);

  // 페이지 그룹 계산
  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  // 페이지 클릭 핸들러
  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
    setSearchParams({ page: pageNum });
    window.scrollTo(0, 0);
  };

  // URL의 page 값이 바뀌면 state를 갱신
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(pageFromUrl);
  }, [searchParams]);

  return (
    <PageLayout>
      <h2 style={{ marginBottom: '16px', color: '#2F2F2F' }}>📰 뉴스 목록</h2>

      {currentNews.map((news) => {
        // DB1 기준: news_id, title, publish_date 등 사용
        // 만약 positiveStocks, negativeStocks가 없으면 빈 배열로 처리
        const allTags = [
          ...((news.positiveStocks || []).map(name => ({ name, isPositive: true }))),
          ...((news.negativeStocks || []).map(name => ({ name, isPositive: false })))
        ];
        const limitedTags = allTags.slice(0, 4);

        return (
          <div
            key={news.news_id}
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {/* 왼쪽: 뉴스 제목/발행일, 오른쪽: 태그들 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* 왼쪽 영역 (클릭 시 상세페이지로 이동) */}
              <div
                style={{ cursor: 'pointer', flex: 1 }}
                onClick={() => navigate(`/news/${news.news_id}`)}
              >
                <h4 style={{ margin: '0 0 6px 0', color: '#2F2F2F' }}>{news.title}</h4>
                <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>
                  {news.publish_date}
                </p>
              </div>

              {/* 오른쪽 영역: 태그들 */}
              <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                {limitedTags.map((tag, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: tag.isPositive ? '#D62828' : '#1D4ED8',
                      color: '#fff',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                    }}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* 페이지네이션 영역 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '12px' }}>
        {/* << 첫 그룹 */}
        <button
          onClick={() => handlePageClick(1)}
          disabled={startPage === 1}
          style={navBtnStyle(startPage === 1)}
        >
          &laquo;
        </button>

        {/* < 이전 그룹 */}
        <button
          onClick={() => handlePageClick(startPage - 1)}
          disabled={startPage === 1}
          style={navBtnStyle(startPage === 1)}
        >
          &lt;
        </button>

        {/* 현재 그룹의 페이지들 */}
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

        {/* > 다음 그룹 */}
        <button
          onClick={() => handlePageClick(endPage + 1)}
          disabled={endPage === totalPages}
          style={navBtnStyle(endPage === totalPages)}
        >
          &gt;
        </button>

        {/* >> 마지막 그룹 */}
        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={endPage === totalPages}
          style={navBtnStyle(endPage === totalPages)}
        >
          &raquo;
        </button>
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
