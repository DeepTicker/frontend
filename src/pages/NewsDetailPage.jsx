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

  // 배경지식 HTML 처리 함수 수정
  const processBackgroundHtml = (html) => {
    if (!html) return html;

    // 1. <p>{...JSON...}</p> 패턴을 찾아서 파싱
    html = html.replace(
      /<p>({.*?})<\/p>/gs,
      (match, jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr);
          // background 필드가 있으면 그걸 반환, 아니면 전체를 문자열로
          return parsed.background ? parsed.background : '';
        } catch {
          return match; // 파싱 실패시 원본 유지
        }
      }
    );

    // 2. stock-buttons div를 찾아서 처리 (기존 코드)
    return html.replace(
      /<div class="stock-buttons">([\s\S]*?)<\/div>/g,
      (match, content) => {
        // 모든 버튼 추출 (onclick="navigateToStock('CODE')")
        const buttonRegex = /<button[^>]*onclick="navigateToStock\('([^']+)'\)"[^>]*>([^<]+)<\/button>/g;
        const buttons = [];
        let buttonMatch;
        while ((buttonMatch = buttonRegex.exec(content)) !== null) {
          buttons.push({ code: buttonMatch[1], name: buttonMatch[2] });
        }

        // 처음 5개 버튼만 표시하고 나머지는 숨김
        const visibleButtons = buttons.slice(0, 5)
          .map(btn => `<button onclick="navigateToStock('${btn.code}')">${btn.name}</button>`)
          .join('');
        const remainingButtons = buttons.slice(5);

        if (remainingButtons.length > 0) {
          // 남은 버튼 정보를 data-remaining에 JSON으로 저장
          return `
            <div class="stock-buttons" data-remaining='${JSON.stringify(remainingButtons)}'>
              ${visibleButtons}
              <button class="show-more-stocks">+ 더보기 (${remainingButtons.length})</button>
            </div>
          `;
        }

        return `<div class="stock-buttons">${visibleButtons}</div>`;
      }
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

    let backgroundContent = '';
    if (typeof background.background === 'string') {
      backgroundContent = background.background;
    } else if (typeof background.background === 'object' && background.background.html) {
      backgroundContent = background.background.html;
    }

    // 배경지식 HTML 처리
    return processBackgroundHtml(backgroundContent);
  };

  // getAllBackgrounds 함수 수정
  const getAllBackgrounds = () => {
    if (!rawNews?.classifications || !gptNews?.backgrounds) {
      console.log('배경지식 데이터 없음');
      return null;
    }
    
    // 모든 배경지식을 HTML로 결합하고 처리
    const backgrounds = gptNews.backgrounds
      .map(bg => {
        if (typeof bg.background === 'string') return bg.background;
        if (typeof bg.background === 'object' && bg.background.html) return bg.background.html;
        return '';
      })
      .filter(Boolean)
      .map(html => processBackgroundHtml(html));
    
    console.log('모든 배경지식:', backgrounds);
    return backgrounds.join('<hr/>');
  };

  // getCurrentSummary 함수 수정
  const getCurrentSummary = () => {
    if (!gptNews?.summary) return null;
    
    const summary = { ...gptNews.summary };
    
    // full_summary가 JSON 문자열인 경우 파싱
    if (typeof summary.full_summary === 'string' && summary.full_summary.trim().startsWith('```json')) {
      try {
        // ```json과 ``` 제거
        const jsonStr = summary.full_summary.replace(/```json\n|\n```/g, '').trim();
        const parsedSummary = JSON.parse(jsonStr);
        summary.full_summary = parsedSummary;
      } catch (err) {
        console.error('JSON 파싱 오류:', err);
        // 파싱 실패시 원본 문자열 유지
      }
    }
    
    return summary;
  };

  // JSON 객체를 JSX로 변환하는 함수 추가
  const renderSummaryContent = (content) => {
    if (!content) return '요약 데이터 없음';
    
    // 문자열인 경우 그대로 반환
    if (typeof content === 'string') {
      return content;
    }
    
    // 객체인 경우 구조화된 형태로 렌더링
    if (typeof content === 'object') {
      return (
        <div className="structured-summary">
          {content.problem && (
            <div className="summary-section">
              <h6>문제점</h6>
              <p>{content.problem}</p>
            </div>
          )}
          {content.causes && content.causes.length > 0 && (
            <div className="summary-section">
              <h6>원인</h6>
              <ul>
                {content.causes.map((cause, index) => (
                  <li key={index}>{cause}</li>
                ))}
              </ul>
            </div>
          )}
          {content.strategy && (
            <div className="summary-section">
              <h6>전략</h6>
              <p>{content.strategy}</p>
            </div>
          )}
          {content.implications && (
            <div className="summary-section">
              <h6>시사점</h6>
              <p>{content.implications}</p>
            </div>
          )}
        </div>
      );
    }
    
    return '요약 데이터 없음';
  };

  // getAllSummaries 함수 수정
  const getAllSummaries = () => {
    if (!gptNews?.summary) return null;
    
    const summary = { ...gptNews.summary };
    
    // full_summary가 JSON 문자열인 경우 파싱
    if (typeof summary.full_summary === 'string' && summary.full_summary.trim().startsWith('```json')) {
      try {
        // ```json과 ``` 제거
        const jsonStr = summary.full_summary.replace(/```json\n|\n```/g, '').trim();
        const parsedSummary = JSON.parse(jsonStr);
        summary.full_summary = parsedSummary;
      } catch (err) {
        console.error('JSON 파싱 오류:', err);
        // 파싱 실패시 원본 문자열 유지
      }
    }
    
    return [{
      category: '전체',
      one_line_summary: summary.one_line_summary,
      full_summary: summary.full_summary
    }];
  };

  // useEffect 추가: 더보기 버튼 이벤트 처리
  useEffect(() => {
    const handleShowMoreStocks = (event) => {
      if (event.target.classList.contains('show-more-stocks')) {
        const container = event.target.closest('.stock-buttons');
        if (!container) return;

        const remainingStocks = JSON.parse(container.dataset.remaining || '[]');
        if (remainingStocks.length === 0) return;

        // 남은 버튼들을 HTML로 만들어서 추가
        const newButtons = remainingStocks.map(
          stock => `<button onclick="navigateToStock('${stock.code}')">${stock.name}</button>`
        ).join('');
        event.target.insertAdjacentHTML('beforebegin', newButtons);
        event.target.remove();
      }
    };

    document.addEventListener('click', handleShowMoreStocks);
    return () => document.removeEventListener('click', handleShowMoreStocks);
  }, [gptNews?.backgrounds]); // backgrounds가 변경될 때마다 이벤트 리스너 재설정

  // 긍정/부정 주식 추출
  const sentimentBackground = gptNews?.backgrounds?.find(bg => bg.sentimentData);
  const positiveStocks = sentimentBackground?.sentimentData?.positive_stocks || [];
  const negativeStocks = sentimentBackground?.sentimentData?.negative_stocks || [];

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
                    {renderSummaryContent(summary.full_summary)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="summary-content">
                {renderSummaryContent(getCurrentSummary()?.full_summary)}
              </div>
            )}

            {/* 배경지식 섹션 */}
            <div>
              <h4 className="section-title">배경지식</h4>
              {/* 배경지식 내용 */}
              {level === "초급" ? (
                <BackgroundKnowledge background={getAllBackgrounds()} />
              ) : (
                <div className="background-content">
                  <BackgroundKnowledge 
                    background={getCurrentBackground()} 
                  />
                  {/* 슬라이더 버튼을 배경지식 아래에, 카테고리가 2개 이상일 때만 노출 */}
                  {rawNews.classifications.length > 1 && (
                    <div className="background-slider-bottom">
                      <button 
                        className="slider-button prev"
                        onClick={handlePrevBackground}
                        disabled={rawNews.classifications.length <= 1}
                      >
                        &lt;
                      </button>
                      <div className="background-pagination">
                        {currentBackgroundIndex + 1} / {rawNews.classifications.length}
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
                  <div className="background-controls">
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
              )}
            </div>
          </div>

          {/* 상승/하락 주식 (오른쪽 영역 하단) */}
          <div className="stock-section">
            <h4 className="section-title">긍정/부정 주식</h4>
            <div className="news-detail-stock-list">
              {positiveStocks.map(stock =>
                <button
                  key={stock.code}
                  onClick={() => navigate(`/stocks/${stock.code}`)}
                  className="stock-button positive"
                >
                  {stock.name}
                </button>
              )}
              {negativeStocks.map(stock =>
                <button
                  key={stock.code}
                  onClick={() => navigate(`/stocks/${stock.code}`)}
                  className="stock-button negative"
                >
                  {stock.name}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NewsDetailPage; 