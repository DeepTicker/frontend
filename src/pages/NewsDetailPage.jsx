// pages/NewsDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import BackgroundKnowledge from '../components/BackgroundKnowledge';
import '../components/BackgroundKnowledge.css'; // 배경지식 컴포넌트 CSS
import './NewsDetailPage.css'; // 뉴스 페이지 CSS

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const newsId = parseInt(id);

  const [rawNews, setRawNews] = useState(null);
  const [gptNews, setGptNews] = useState(null);
  const [level, setLevel] = useState("중급");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [, setLoading] = useState(true);
  
  // 카테고리에 따른 상태 변수들
  const [isIndustry, setIsIndustry] = useState(false);
  const [isTheme, setIsTheme] = useState(false);
  const [isMacro, setIsMacro] = useState(false);
  const [isStock, setIsStock] = useState(false);
  const [isElse, setIsElse] = useState(false);

  // 뉴스 원문 데이터 가져오기
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/news/${newsId}?level=${level}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setRawNews(data?.rawNews || null);
        setGptNews(data?.gptNews || null);
        
        // 카테고리에 따른 상태 설정
        if (data?.rawNews?.category) {
          const category = data.rawNews.category;
          setIsIndustry(category === '산업군');
          setIsTheme(category === '테마');
          setIsMacro(category === '전반적');
          setIsStock(category === '개별주');
          setIsElse(category === '그 외');
          
          console.log('카테고리:', category);
          console.log('대표:', data.rawNews.representative);
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("데이터 로딩 오류:", err);
        setLoading(false);
      });
  }, [newsId, level]);
  
  // 배경지식 재생성 함수
  const handleRegenerate = async () => {
    if (isRegenerating) return;
    
    try {
      setIsRegenerating(true);
      console.log('재생성 요청 시작:', { newsId, level, category: rawNews.category });
      
      // 카테고리에 따라 API 엔드포인트 설정
      const endpoint = isIndustry 
        ? 'http://localhost:5000/api/news/industry/regenerate'
        : isTheme 
          ? 'http://localhost:5000/api/news/theme/regenerate'
          : null;
          
      if (!endpoint) {
        throw new Error('지원하지 않는 카테고리입니다.');
      }
      
      // API 요청
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          newsId, 
          level,
          news_id: newsId,
          representative: rawNews.representative // 대표 정보도 전달
        })
      });
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('재생성 결과:', result);
      
      if (result && (result.success || result.status === 'success')) {
        // 성공적으로 재생성되면 데이터를 새로고침
        console.log('재생성 성공, 데이터 새로고침');
        fetch(`http://localhost:5000/api/news/${newsId}?level=${level}`)
          .then(res => {
            if (!res.ok) throw new Error('데이터 갱신 실패');
            return res.json();
          })
          .then(data => {
            console.log('새로운 데이터:', data);
            setRawNews(data?.rawNews || null);
            setGptNews(data?.gptNews || null);
            alert('배경지식이 재생성되었습니다.');
          })
          .catch(err => {
            console.error('데이터 갱신 실패:', err);
            alert('배경지식 생성 후 데이터 갱신 중 오류가 발생했습니다.');
          });
      } else {
        alert('배경지식 재생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('재생성 중 오류 발생:', err);
      alert(`재생성 오류: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  // 데이터가 없으면 에러 처리
  if (!rawNews) {
    return (
      <PageLayout>
        <p>존재하지 않는 뉴스입니다. : 데이터가 없음</p>
      </PageLayout>
    );
  }
  
  console.log('산업군 여부 최종 확인:', isIndustry, '레벨:', level);
  console.log('배경지식 내용 존재 여부:', Boolean(gptNews?.background));

  const handleGoBack = () => {
    const fromPage = location.state?.fromPage;
    if (fromPage) {
      navigate(`/news?page=${fromPage}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <PageLayout>
      <div className="news-detail-container">
        {/* 왼쪽 영역: 뉴스 원본 데이터 */}
        <div className="news-content-section">
          <button onClick={handleGoBack} className="back-button">
            ← 뒤로가기
          </button>
          <h2 className="news-title">{rawNews.title}</h2>
          <p className="news-meta">
            {rawNews.press} | {rawNews.reporter} | {new Date(rawNews.date).toLocaleDateString()}
          </p>
          
          {/* 카테고리 및 대표 정보 표시 */}
          {rawNews.category && (
            <div className="news-category-tag">
              <span className="news-category-label">분류: {rawNews.category}</span>
              {rawNews.category !== '그 외' && rawNews.representative && (
                <span className="news-representative">| 대표: {rawNews.representative}</span>
              )}
            </div>
          )}
          
          <p className="news-content-text">{rawNews.content}</p>
        </div>

        {/* 오른쪽 영역: GPT 처리 데이터 (요약, 배경, 상승/하락 주식) */}
        <div className="news-analysis-section">
          {/* 난이도 선택 버튼 */}
          <div className="level-selector">
            {["초급", "중급", "고급"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`level-button ${level === lvl ? 'active' : ''}`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* 기사 요약과 배경지식 */}
          <div className="summary-section">
            <h4 className="section-title">한줄 요약</h4>
            <p className="summary-text">{gptNews?gptNews.one_line_summary:'요약 데이터 없음'}</p>

            <h4 className="section-title">전체 요약</h4>
            <p className="summary-text">{gptNews?gptNews.full_summary:'요약 데이터 없음'}</p>

            {/* 배경지식 섹션 */}
            <div className="background-section-header">
              <h4 className="section-title">배경지식</h4>
              {/* 산업군 또는 테마 + 중급 레벨일 때 재생성 버튼 표시 */}
              {(isIndustry || isTheme) && level === "중급" && (
                <button 
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className={`regenerate-button ${isRegenerating ? 'disabled' : ''}`}
                >
                  {isRegenerating ? '재생성 중...' : '재생성'}
                </button>
              )}
            </div>
            <div className="background-knowledge-wrapper">
              {gptNews && gptNews.background ? (
                <BackgroundKnowledge background={gptNews.background} />
              ) : (
                <p>
                  배경지식 데이터가 없습니다.
                </p>
              )}
            </div>
          </div>

          {/* 상승/하락 주식 (오른쪽 영역 하단) */}
          <div className="stock-section">
            <h4 className="section-title">긍정/부정 주식</h4>
            <div className="stock-list">
              {(gptNews?.positive_stocks||[]).map((stock) =>
                isIndustry ? (
                  <div
                    key={stock}
                    className="stock-positive"
                  >
                    {stock}
                  </div>
                ) : (
                  <button
                    key={stock}
                    onClick={() => navigate(`/stocks/${stock}`)}
                    className="stock-button positive"
                  >
                    {stock}
                  </button>
                )
              )}
              {(gptNews?.negative_stocks||[]).map((stock) =>
                isIndustry ? (
                  <div
                    key={stock}
                    className="stock-negative"
                  >
                    {stock}
                  </div>
                ) : (
                  <button
                    key={stock}
                    onClick={() => navigate(`/stocks/${stock}`)}
                    className="stock-button negative"
                  >
                    {stock}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NewsDetailPage;