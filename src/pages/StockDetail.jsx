import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function StockDetail() {
  const { id } = useParams();
  const stock_id = decodeURIComponent(id);

  const [predicts, setPredicts] = useState([]);
  const [factors, setFactors] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [predictRes, factorRes, recomRes, newsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/stocks/${stock_id}/predictions`),
          fetch(`http://localhost:5000/api/stocks/${stock_id}/factors`),
          fetch(`http://localhost:5000/api/stocks/${stock_id}/recommendations`),
          fetch(`http://localhost:5000/api/stocks/${stock_id}/news`),
        ]);

        const predictData = await predictRes.json();
        const factorData = await factorRes.json();
        const recomData = await recomRes.json();
        const newsData = await newsRes.json();

        setPredicts(predictData);
        setFactors(factorData);
        setRecommendations(recomData);
        setNewsList(newsData);
      } catch (err) {
        console.error("Error fetching stock detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [stock_id]);

  if (loading) return <div className="p-6">로딩 중...</div>;
  // if (!stock) return <div className="p-6">종목 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="p-6">
      {/* <h1 className="text-2xl font-bold">{stock.name}</h1>
      <p className="text-lg">현재가: {Number(stock.current_price).toLocaleString()}원</p>
      <div className="mt-4">
        <p>시총: {Number(stock.market_cap).toLocaleString()}억</p>
        <p>거래량: {Number(stock.volume).toLocaleString()}</p>
      </div> */}

      {/* 그래프 자리 */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">가격 변동 그래프</h2>
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">그래프 자리</div>
      </div>

      {/* 상승/하강 요인 */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">상승/하강 요인</h2>
        <div className="p-4 border rounded-lg space-y-2">
          <div>
            <span className="font-bold text-green-600">상승 요인:</span>{" "}
            {factors?.inc_factor_description || "정보 없음"}
          </div>
          <div>
            <span className="font-bold text-red-600">하강 요인:</span>{" "}
            {factors?.dec_factor_description || "정보 없음"}
          </div>
        </div>
      </div>

      {/* 추천 종목 */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">추천 종목</h2>
        <ul className="p-4 border rounded-lg space-y-1 list-disc list-inside">
          {recommendations.map((recom, idx) => (
            <li key={idx}>{recom.similar_stock_name || recom}</li>
          ))}
        </ul>
      </div>

      {/* 관련 뉴스 */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">관련 뉴스</h2>
        <ul className="p-4 border rounded-lg space-y-4 list-disc list-inside">
          {newsList.map((news, idx) => (
            <li key={idx}>
              <div>
                <a>
                  {news.event_type}
                </a>
                <p className="ml-4 mt-1 text-gray-700">{news.news_content}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
