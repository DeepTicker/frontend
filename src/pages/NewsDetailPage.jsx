// pages/NewsDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const newsId = parseInt(id);

  const [rawNews, setRawNews] = useState(null);
  const [gptNews, setGptNews] = useState(null);
  const [level, setLevel] = useState("중급");
  const [, setLoading] = useState(true);

  // 뉴스 원문 데이터 가져오기
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/news/${newsId}?level=${level}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setRawNews(data?.rawNews || null);
        setGptNews(data?.gptNews || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [newsId, level]);
  

  // 데이터가 없으면 에러 처리
  if (!rawNews) {
    return (
      <PageLayout>
        <p>존재하지 않는 뉴스입니다. : 데이터가 없음</p>
      </PageLayout>
    );
  }

  // 산업군 여부 판별
  const isIndustry = gptNews?.stock_type === "산업군";

  return (
    <PageLayout>
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* 왼쪽 영역: 뉴스 원본 데이터 */}
        <div style={{ flex: 3 }}>
          <button onClick={() => navigate(-1)} style={{ marginTop: '10px', marginBottom: '16px' }}>
            ← 뒤로가기
          </button>
          <h2 style={{ color: '#2F2F2F', marginBottom: '8px' }}>{rawNews.title}</h2>
          <p style={{ fontSize: '12px', color: '#777' }}>
            {rawNews.press} | {rawNews.reporter} | {new Date(rawNews.date).toLocaleDateString()}
          </p>
          <p style={{ fontSize: '14px', color: '#555' }}>{rawNews.content}</p>
        </div>

        {/* 오른쪽 영역: GPT 처리 데이터 (요약, 배경, 상승/하락 주식) */}
        <div
          style={{
            flex: 2,
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* 난이도 선택 버튼 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {["초급", "중급", "고급"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: level === lvl ? '#eee' : '#fff',
                  cursor: 'pointer',
                  fontWeight: level === lvl ? 'bold' : 'normal'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* 기사 요약과 배경지식 */}
          <div>
            <h4 style={{ margin: '4px 0' }}>한줄 요약</h4>
            <p style={{ fontSize: '14px', color: '#333' }}>{gptNews?gptNews.one_line_summary:'요약 데이터 없음'}</p>

            <h4 style={{ margin: '4px 0' }}>전체 요약</h4>
            <p style={{ fontSize: '14px', color: '#333' }}>{gptNews?gptNews.full_summary:'요약 데이터 없음'}</p>

            <h4 style={{ margin: '4px 0' }}>배경지식</h4>
            {gptNews && gptNews.background ? (
              <div 
                style={{ fontSize: '14px', color: '#333' }}
                dangerouslySetInnerHTML={{ __html: gptNews.background }}
              />
            ) : (
              <p style={{ fontSize: '14px', color: '#333' }}>요약 데이터 없음</p>
            )}
          </div>

          {/* 상승/하락 주식 (오른쪽 영역 하단) */}
          <div>
            <h4 style={{ marginBottom: '8px' }}>긍정/부정 주식</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(gptNews?.positive_stocks||[]).map((stock) =>
                isIndustry ? (
                  <div
                    key={stock}
                    style={{
                      backgroundColor: '#D62828',
                      color: '#fff',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px'
                    }}
                  >
                    {stock}
                  </div>
                ) : (
                  <button
                    key={stock}
                    onClick={() => navigate(`/stocks/${stock}`)}
                    style={{
                      backgroundColor: '#D62828',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {stock}
                  </button>
                )
              )}
              {(gptNews?.negative_stocks||[]).map((stock) =>
                isIndustry ? (
                  <div
                    key={stock}
                    style={{
                      backgroundColor: '#1D4ED8',
                      color: '#fff',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px'
                    }}
                  >
                    {stock}
                  </div>
                ) : (
                  <button
                    key={stock}
                    onClick={() => navigate(`/stocks/${stock}`)}
                    style={{
                      backgroundColor: '#1D4ED8',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
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
