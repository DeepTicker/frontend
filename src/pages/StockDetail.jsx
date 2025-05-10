import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";


export default function StockDetail() {
  const { id } = useParams();
  const stock_id = decodeURIComponent(id);
  // // const [predicts, setPredicts] = useState([]);
  // // const [factors, setFactors] = useState([]);
  // const [recommendations, setRecommendations] = useState([]);
  // // const [newsList, setNewsList] = useState([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchAllData = async () => {
  //     try {
  //       const [recomRes] = await Promise.all([
  //         // fetch(`http://localhost:5000/api/stocks/${stock_id}/predictions`),
  //         // fetch(`http://localhost:5000/api/stocks/${stock_id}/factors`),
  //         fetch(`http://localhost:5000/api/stocks/${stock_id}/recommendations`),
  //         // fetch(`http://localhost:5000/api/stocks/${stock_id}/news`),
  //       ]);

  //       // const predictData = await predictRes.json();
  //       // const factorData = await factorRes.json();
  //       const recommendations = await recomRes.json();
  //       // const newsData = await newsRes.json();

  //       // setPredicts(predictData);
  //       // setFactors(factorData);
  //       setRecommendations(recommendations);
  //       console.log("recommendations", recommendations);
  //       // setNewsList(newsData);
  //     } catch (err) {
  //       console.error("Error fetching stock detail:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchAllData();
  // }, [stock_id]);
  const [stockData, setStock] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [prediction, setPrediction] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [stockRes, recomRes, predictRes] = await Promise.all([
          fetch(`http://localhost:5000/api/stocks/${stock_id}/data`),
          fetch(`http://localhost:5000/api/stocks/${stock_id}/recommendations`),
          fetch(`http://localhost:5000/api/stocks/${stock_id}/predictions`)
        ]);

        const stockData = await stockRes.json();
        const recommendations = await recomRes.json();
        const predictionData = await predictRes.json();

        setStock(stockData);
        setRecommendations(recommendations);
        setPrediction(predictionData);
      } catch (err) {
        console.error("Error fetching stock detail:", err);
      } finally {
        // setLoading(false);
      }
    };

    fetchAllData();
  }, [stock_id]);

  if (!stockData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{stockData[0].name}</h1>
      <p className="text-lg">{recommendations[0].cluster_name}</p>

      <div className="mt-4 space-y-1">
        <p>시가총액: {stockData[0].market_cap}</p>
        <p>변화량: {stockData[0].change_rate}</p>
      </div>

      <div className="mt-6">
        <table className="w-full mt-2 table-auto border-collapse border border-gray-300 text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">시가 (Open)</th>
              <th className="border border-gray-300 px-4 py-2">종가 (Close)</th>
              <th className="border border-gray-300 px-4 py-2">고가 (High)</th>
              <th className="border border-gray-300 px-4 py-2">저가 (Low)</th>
              <th className="border border-gray-300 px-4 py-2">거래량 (Volume)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">{Math.round(stockData[0].open).toLocaleString()}원</td>
              <td className="border border-gray-300 px-4 py-2">{Math.round(stockData[0].current_price).toLocaleString()}원</td>
              <td className="border border-gray-300 px-4 py-2">{Math.round(stockData[0].high).toLocaleString()}원</td>
              <td className="border border-gray-300 px-4 py-2">{Math.round(stockData[0].low).toLocaleString()}원</td>
              <td className="border border-gray-300 px-4 py-2">{Math.round(stockData[0].volume).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>


      {/* 그래프 자리 */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">예측 주가 추이</h2>
        {prediction.length === 0 ? (
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-500">
            예측 데이터 없음
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prediction}>
              <XAxis dataKey="predict_day"/>
              <YAxis domain={['dataMin', 'dataMax']}/>
              <Tooltip />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="predicted_close" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>


      {/* 상승/하강 요인
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
      </div> */}

      {/* 추천 종목
      <div className="mt-6">
        <h2 className="text-xl font-semibold">추천 종목</h2>
        <ul className="p-4 border rounded-lg space-y-1 list-disc list-inside">
          {recommendations.map((recom, idx) => (
            <li key={idx}>{recom.similar_stock_name || recom}</li>
          ))}
        </ul>
      </div> */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">추천 종목</h2>
        <ul className="p-4 border rounded-lg space-y-1 list-disc list-inside">
          {recommendations.length > 0 && (
            <>
              {recommendations[0].similar_stock_name_1 && (
                <li>{recommendations[0].similar_stock_name_1}</li>
              )}
              {recommendations[0].similar_stock_name_2 && (
                <li>{recommendations[0].similar_stock_name_2}</li>
              )}
              {recommendations[0].similar_stock_name_3 && (
                <li>{recommendations[0].similar_stock_name_3}</li>
              )}
            </>
          )}
        </ul>
      </div>


      {/* 관련 뉴스
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
      </div> */}
    </div>
  );
}
