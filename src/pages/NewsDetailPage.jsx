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

  // 뉴스 원문 데이터 가져오기
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/news/${newsId}?level=${level}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        console.log('받은 데이터:', data); // 디버깅용 로그 추가
        
        setRawNews({
          ...data?.rawNews,
          classifications: Array.isArray(data?.rawNews?.classifications)
            ? data.rawNews.classifications
            : [],
        });
        
        // summary와 backgrounds를 gptNews로 설정
        setGptNews({
          summary: data?.summary || null,
          backgrounds: Array.isArray(data?.backgrounds) ? data.backgrounds : []
        });
        
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
      const currentClassification = rawNews.classifications[currentBackgroundIndex];
      console.log('재생성 요청 시작:', { 
        newsId, 
        level, 
        category: currentClassification.category,
        representative: currentClassification.representative,
        stock_code: currentClassification.stock_code,
        theme_name: currentClassification.theme_name
      });
      
      // 현재 선택된 카테고리에 따라 API 엔드포인트 설정
      const endpoint = currentClassification.category === '산업군'
        ? 'http://localhost:5000/api/news/industry/regenerate'
        : currentClassification.category === '테마'
          ? 'http://localhost:5000/api/news/theme/regenerate'
          : currentClassification.category === '전반적'
            ? 'http://localhost:5000/api/news/macro/regenerate'
            : currentClassification.category === '개별주'
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
          news_id: newsId,
          level,
          representative: currentClassification.representative,
          stockCode: currentClassification.category === '개별주' ? currentClassification.stock_code : null,
          themeName: currentClassification.category === '테마' ? currentClassification.theme_name : null
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
            setGptNews({
              summary: data?.summary || null,
              backgrounds: data?.backgrounds || []
            });
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
    if (!rawNews?.classifications || !gptNews?.backgrounds) {
      console.log('배경지식 데이터 없음:', { 
        classifications: rawNews?.classifications,
        backgrounds: gptNews?.backgrounds 
      });
      return null;
    }
    
    const currentClassification = rawNews.classifications[currentBackgroundIndex];
    console.log('현재 분류:', currentClassification);
    
    // 카테고리와 대표어가 일치하는 배경지식 찾기
    const background = gptNews.backgrounds.find(
      bg => bg.category === currentClassification.category && 
           bg.representative === currentClassification.representative
    );
    
    console.log('찾은 배경지식:', background);
    if (!background) return '';

    if (typeof background.background === 'string') {
      return background.background;
    }

    if (typeof background.background === 'object' && background.background.html) {
      return background.background.html;
    }

    return '';
  };

  // getAllBackgrounds 함수 수정
  const getAllBackgrounds = () => {
    if (!rawNews?.classifications || !gptNews?.backgrounds) {
      console.log('배경지식 데이터 없음');
      return null;
    }
    
    // 모든 배경지식을 HTML로 결합
    const backgrounds = gptNews.backgrounds
      .map(bg => bg.background)
      .filter(Boolean);
    
    console.log('모든 배경지식:', backgrounds);
    return backgrounds.join('<hr/>');
  };

  // getCurrentSummary 함수 수정
  const getCurrentSummary = () => {
    if (!gptNews?.summary) return null;
    
    // 고급 난이도일 때 full summary를 JSON 파싱
    if (level === "고급" && gptNews.summary.full_summary) {
      try {
        // JSON 문자열에서 실제 JSON 부분만 추출 (```json\n{ ... }\n``` 형식 처리)
        const jsonStr = gptNews.summary.full_summary.replace(/```json\n|\n```/g, '');
        const parsedSummary = JSON.parse(jsonStr);
        return {
          ...gptNews.summary,
          parsed_full_summary: parsedSummary
        };
      } catch (error) {
        console.error('JSON 파싱 에러:', error);
        return gptNews.summary;
      }
    }
    
    return gptNews.summary;
  };

  // getAllSummaries 함수 수정
  const getAllSummaries = () => {
    if (!gptNews?.summary) return null;
    
    return [{
      category: '전체',
      one_line_summary: gptNews.summary.one_line_summary,
      full_summary: gptNews.summary.full_summary
    }];
  };

  // 데이터가 없으면 에러 처리
  if (!rawNews) {
    return (
      <PageLayout>
        <p>존재하지 않는 뉴스입니다. : 데이터가 없음</p>
      </PageLayout>
    );
  }
  
  const handleGoBack = () => {
    const fromPage = location.state?.fromPage;
    const storedPage = localStorage.getItem('newsListPage');
    
    console.log('뒤로가기 정보:', { 
      fromPage, 
      storedPage,
      locationState: location.state 
    });
    
    if (fromPage && !isNaN(fromPage) && fromPage > 0) {
      navigate(`/news?page=${fromPage}`);
    } 
    else if (storedPage && !isNaN(parseInt(storedPage)) && parseInt(storedPage) > 0) {
      navigate(`/news?page=${parseInt(storedPage)}`);
    }
    else {
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
          <h2 className="news-detail-title">{rawNews.title}</h2>
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
          {/* 뉴스 제목 아래, 뉴스 본문 위 */}
          {rawNews.image_url && (
            <div className="news-image-wrapper">
              <img src={rawNews.image_url} alt="뉴스 대표 이미지" className="news-image" />
              {rawNews.image_desc && (
                <p className="news-image-desc">{rawNews.image_desc}</p>
              )}
            </div>
          )}
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
                    <p className="summary-text">{summary.full_summary || '요약 데이터 없음'}</p>
                  </div>
                ))}
              </div>
            ) : level === "고급" ? (
              <div className="summary-structured">
                {getCurrentSummary()?.parsed_full_summary ? (
                  <>
                    <div className="summary-section">
                      <h5 className="summary-subtitle">문제 상황</h5>
                      <p className="summary-text">{getCurrentSummary().parsed_full_summary.problem}</p>
                    </div>
                    <div className="summary-section">
                      <h5 className="summary-subtitle">원인</h5>
                      <ul className="summary-list">
                        {getCurrentSummary().parsed_full_summary.causes.map((cause, index) => (
                          <li key={index} className="summary-text">{cause}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="summary-section">
                      <h5 className="summary-subtitle">전략</h5>
                      <p className="summary-text">{getCurrentSummary().parsed_full_summary.strategy}</p>
                    </div>
                    <div className="summary-section">
                      <h5 className="summary-subtitle">시사점</h5>
                      <p className="summary-text">{getCurrentSummary().parsed_full_summary.implications}</p>
                    </div>
                  </>
                ) : (
                  <p className="summary-text">{getCurrentSummary()?.full_summary || '요약 데이터 없음'}</p>
                )}
              </div>
            ) : (
              <p className="summary-text">
                {getCurrentSummary()?.full_summary || '요약 데이터 없음'}
              </p>
            )}

            {/* 배경지식 섹션 */}
            <div className="background-section-header">
              <h4 className="section-title">배경지식</h4>
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
                    aria-label="이전 배경지식"
                  >
                    ‹
                  </button>
                  <div className="background-content">
                    <BackgroundKnowledge 
                      background={getCurrentBackground()} 
                    />
                    <div className="background-controls">
                      {rawNews.classifications.length > 1 && (
                        <div className="background-pagination">
                          {currentBackgroundIndex + 1} / {rawNews.classifications.length}
                        </div>
                      )}
                      {/* 현재 카테고리가 지원되는 카테고리이고 중급 레벨일 때만 재생성 버튼 표시 */}
                      {['산업군', '테마', '전반적', '개별주'].includes(rawNews.classifications[currentBackgroundIndex]?.category) && 
                       level === "중급" && (
                        <button 
                          onClick={handleRegenerate}
                          disabled={isRegenerating}
                          className={`regenerate-button ${isRegenerating ? 'disabled' : ''}`}
                        >
                          {isRegenerating ? '재생성 중...' : '재생성'}
                        </button>
                      )}
                    </div>
                  </div>
                  <button 
                    className="slider-button next"
                    onClick={handleNextBackground}
                    disabled={rawNews.classifications.length <= 1}
                    aria-label="다음 배경지식"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 상승/하락 주식 (오른쪽 영역 하단) */}
          <div className="stock-section">
            <h4 className="section-title">긍정/부정 주식</h4>
            <div className="news-detail-stock-list">
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