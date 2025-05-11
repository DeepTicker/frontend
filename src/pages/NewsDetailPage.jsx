import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import BackgroundKnowledge from '../components/BackgroundKnowledge';
import '../components/BackgroundKnowledge.css';
import './NewsDetailPage.css';

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

  const [currentPage, setCurrentPage] = useState(1);
  const [newsList, setNewsList] = useState([]);
  const [totalNews, setTotalNews] = useState(0);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  // makeKey 함수 수정
  const makeKey = (category, representative) => {
    const key = `${category}_${representative}`
      .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거
      .replace(/\s+/g, '') // 공백 제거
      .slice(0, 15); // 15자로 제한
    
    console.log('키 생성 과정:', {
      원본: `${category}_${representative}`,
      최종키: key
    });
    
    return key;
  };

  // 뉴스 원문 데이터 가져오기
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/news/${newsId}?level=${level}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setRawNews({
          ...data?.rawNews,
          classifications: Array.isArray(data?.rawNews?.classifications)
            ? data.rawNews.classifications
            : [],
        });
        // summaries를 gptNews로 설정
        setGptNews({ summaries: data?.summaries || {} });
        
        if (data?.rawNews?.classifications?.[0]?.category) {
          const category = data.rawNews.classifications[0].category;
          setIsIndustry(category === '산업군');
          setIsTheme(category === '테마');
          setIsMacro(category === '전반적');
          setIsStock(category === '개별주');
          setIsElse(category === '그 외');
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
          : isMacro
            ? 'http://localhost:5000/api/news/macro/regenerate'
            : isStock
              ? 'http://localhost:5000/api/news/stock/regenerate'
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
          representative: rawNews.representative,
          stockCode: isStock ? rawNews.representative : null
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
            setGptNews({ summaries: data?.summaries || {} });
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

  // 배경지식 슬라이드 관련 함수들
  const handlePrevBackground = () => {
    setCurrentBackgroundIndex(prev => 
      prev === 0 ? rawNews.classifications.length - 1 : prev - 1
    );
  };

  const handleNextBackground = () => {
    setCurrentBackgroundIndex(prev => 
      prev === rawNews.classifications.length - 1 ? 0 : prev + 1
    );
  };

  // getCurrentBackground 함수 수정
  const getCurrentBackground = () => {
    if (!rawNews || !rawNews.classifications || !gptNews?.summaries) return null;
    
    const currentClassification = rawNews.classifications[currentBackgroundIndex];
    const key = makeKey(currentClassification.category, currentClassification.representative);
    console.log('배경지식 접근 - 사용 가능한 키들:', Object.keys(gptNews.summaries));
    console.log('현재 선택된 키:', key);
    return gptNews.summaries[key]?.background;
  };

  // getAllBackgrounds 함수 수정
  const getAllBackgrounds = () => {
    if (!rawNews || !rawNews.classifications || !gptNews?.summaries) return null;
    
    console.log('전체 배경지식 - 사용 가능한 키들:', Object.keys(gptNews.summaries));
    return rawNews.classifications.map(classification => {
      const key = makeKey(classification.category, classification.representative);
      console.log('각 분류별 키:', key);
      return gptNews.summaries[key]?.background;
    }).filter(Boolean).join('<hr/>');
  };

  // getCurrentSummary 함수 수정
  const getCurrentSummary = () => {
    if (!rawNews || !rawNews.classifications || !gptNews?.summaries) return null;
    
    const currentClassification = rawNews.classifications[currentBackgroundIndex];
    const key = makeKey(currentClassification.category, currentClassification.representative);
    console.log('요약 접근 - 사용 가능한 키들:', Object.keys(gptNews.summaries));
    console.log('현재 선택된 키:', key);
    return gptNews.summaries[key];
  };

  // getAllSummaries 함수 수정
  const getAllSummaries = () => {
    if (!rawNews || !rawNews.classifications || !gptNews?.summaries) return null;
    
    console.log('전체 요약 - 사용 가능한 키들:', Object.keys(gptNews.summaries));
    return rawNews.classifications.map(classification => {
      const key = makeKey(classification.category, classification.representative);
      console.log('각 분류별 키:', key);
      const summary = gptNews.summaries[key];
      return {
        category: classification.category,
        one_line_summary: summary?.one_line_summary,
        full_summary: summary?.full_summary
      };
    }).filter(Boolean);
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
    // localStorage에서도 페이지 정보 가져오기
    const storedPage = localStorage.getItem('newsListPage');
    
    // 디버깅 로그 추가
    console.log('뒤로가기 정보:', { 
      fromPage, 
      storedPage,
      locationState: location.state 
    });
    
    // 우선 location.state의 fromPage 확인, 그 다음 localStorage 확인
    if (fromPage && !isNaN(fromPage) && fromPage > 0) {
      navigate(`/news?page=${fromPage}`);
    } 
    else if (storedPage && !isNaN(parseInt(storedPage)) && parseInt(storedPage) > 0) {
      navigate(`/news?page=${parseInt(storedPage)}`);
    }
    else {
      // 유효한 페이지 정보가 없으면 히스토리 기반 뒤로가기
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
          <div className="news-meta">
            <div className="news-meta-left">
              {rawNews.classifications.map((classification, index) => (
                <React.Fragment key={index}>
                  <span className="news-category">{classification.category}</span>
                  {classification.representative && (
                    <span className="news-representative">
                      {classification.representative}
                    </span>
                  )}
                  {index < rawNews.classifications.length - 1 && (
                    <span className="news-separator">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="news-details">
              <span className="news-press">{rawNews.press}</span>
              <span className="news-date">{new Date(rawNews.date).toLocaleDateString()}</span>
            </div>
          </div>
          
          <p className="news-content-text">{rawNews.content}</p>
        </div>

        {/* 오른쪽 영역: GPT 처리 데이터 */}
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
            {level === "초급" ? (
              <div className="summary-list">
                {getAllSummaries()?.map((summary, index) => (
                  <div key={index} className="summary-item">
                    <span className="summary-category">{summary.category}</span>
                    <p className="summary-text">{summary.one_line_summary || '요약 데이터 없음'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="summary-text">
                {getCurrentSummary()?.one_line_summary || '요약 데이터 없음'}
              </p>
            )}

            <h4 className="section-title">전체 요약</h4>
            {level === "초급" ? (
              <div className="summary-list">
                {getAllSummaries()?.map((summary, index) => (
                  <div key={index} className="summary-item">
                    <span className="summary-category">{summary.category}</span>
                    <p className="summary-text">{summary.full_summary || '요약 데이터 없음'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="summary-text">
                {getCurrentSummary()?.full_summary || '요약 데이터 없음'}
              </p>
            )}

            {/* 배경지식 섹션 */}
            <div className="background-section-header">
              <h4 className="section-title">배경지식</h4>
              {(isIndustry || isTheme || isMacro || isStock) && level === "중급" && (
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
              {level === "초급" ? (
                <BackgroundKnowledge background={getAllBackgrounds()} />
              ) : (
                <div className="background-slider">
                  <button 
                    className="slider-button prev"
                    onClick={handlePrevBackground}
                    disabled={rawNews.classifications.length <= 1}
                  >
                    &lt;
                  </button>
                  <div className="background-content">
                    <BackgroundKnowledge 
                      background={getCurrentBackground()} 
                    />
                    {rawNews.classifications.length > 1 && (
                      <div className="background-pagination">
                        {currentBackgroundIndex + 1} / {rawNews.classifications.length}
                      </div>
                    )}
                  </div>
                  <button 
                    className="slider-button next"
                    onClick={handleNextBackground}
                    disabled={rawNews.classifications.length <= 1}
                  >
                    &gt;
                  </button>
                </div>
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