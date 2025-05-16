import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import 'chartjs-adapter-date-fns';
import "./StockDetail.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// 그라데이션 생성 함수 (예시)
function getGradient(ctx, chartArea, color) {
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  if (color === 'red') {
    gradient.addColorStop(1, 'rgba(234, 67, 53, 0.25)');
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  } else {
    gradient.addColorStop(1, 'rgba(66, 133, 244, 0.25)');
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  }
  return gradient;
}

const getLastMonthLabels = () => {
    const labels = [];
    const today = new Date();
    for (let i = 1; i < 31; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const yyyy = date.getFullYear();
      const mm = (date.getMonth() + 1).toString().padStart(2, '0');
      const dd = date.getDate().toString().padStart(2, '0');
      labels.push(`${yyyy}-${mm}-${dd}`);
    }
    return labels;
};

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

  const formatMarketCap = (value) => {
    const num = Number(value);
    if (num >= 1e12) {
      // 1조 이상
      return `${(num / 1e12).toFixed(1)}조`;
    } else if (num >= 1e8) {
      // 1억 이상 ~ 1조 미만
      return `${(num / 1e8).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}억`;
    } else {
      // 그 외는 만원 단위(천 단위 콤마 포함)
      const manWon = Math.floor(num / 1e4);
      return `${manWon.toLocaleString()}만원`;
    }
  };

  function formatChangeRate(rate) {
    let colorClass = '';
    if (rate> 0) {
      colorClass = 'positive';  // 빨강
    } else if (rate < 0) {
      colorClass = 'negative';  // 파랑
    } else {
      colorClass = 'neutral';   // 회색
    }
    const sign = rate > 0 ? '+' : '';
    return(
      <span>
        변화량 <span className={colorClass}>{sign}{rate}%</span>
      </span>
    );
  }

   const chartData = React.useMemo(() => {
    if (!prediction.length) return null;

    const labels = getLastMonthLabels();
    const dataPoints = prediction.map(item => item.predicted_close);

    // 첫째 날 종가와 마지막 날 종가 비교
    const firstClose = dataPoints[0];
    const lastClose = dataPoints[dataPoints.length - 1];

    return {
      labels,
      datasets: [
        {
          label: 'Predicted',
          data: dataPoints,
          borderColor: firstClose < lastClose ? 'rgb(234, 67, 53)' : 'rgb(66, 133, 244)',  // 빨강 or 파랑
          backgroundColor: function(context) {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return null;
            return getGradient(ctx, chartArea, firstClose < lastClose ? 'red' : 'blue');
          },
          fill: true,
          pointRadius: 1.5,
          borderWidth: 1.5,
        }
      ]
    };
  }, [prediction]);


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          parser: 'yyyy-MM-dd',
          unit: 'day',
          displayFormats: {
            day: 'M/d',
          },
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (KRW)',
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y?.toFixed(0);
            return `금액: ${Number(value).toLocaleString()} KRW`;
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: true,
    },
  };

  if (!stockData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="stock-detail-container p-4">
      <h3 className="text-2xl font-bold">{stockData[0].name}</h3>
      <h1 className="text-xl font-bold mt-2">
        {Math.round(stockData[0].current_price).toLocaleString()}원
      </h1>
      <div className="mt-4 info-row">
        <p className="text-lg">{recommendations[0].cluster_name}</p>
        <p>시가총액 {formatMarketCap(stockData[0].market_cap)}</p>
        {formatChangeRate(stockData[0].change_rate)}
      </div>
      <div className="recommendation-container mt-6">
        <div className="recommendation-list">
          {recommendations.length > 0 && (
            <>
              {recommendations[0].similar_stock_name_1 && recommendations[0].similar_stock_id_1 && (
                <a
                  href={`/stocks/${recommendations[0].similar_stock_id_1}`}
                  className="recommendation-item"
                >
                  {recommendations[0].similar_stock_name_1}
                </a>
              )}
              {recommendations[0].similar_stock_name_2 && recommendations[0].similar_stock_id_2 && (
                <a
                  href={`/stocks/${recommendations[0].similar_stock_id_2}`}
                  className="recommendation-item"
                >
                  {recommendations[0].similar_stock_name_2}
                </a>
              )}
              {recommendations[0].similar_stock_name_3 && recommendations[0].similar_stock_id_3 && (
                <a
                  href={`/stocks/${recommendations[0].similar_stock_id_3}`}
                  className="recommendation-item"
                >
                  {recommendations[0].similar_stock_name_3}
                </a>
              )}
            </>
          )}
        </div>
      </div>
     
      <table className="stock-table">
        <thead>
          <tr>
            <th>시가 (Open)</th>
            <th>종가 (Close)</th>
            <th>고가 (High)</th>
            <th>저가 (Low)</th>
            <th>거래량 (Volume)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{Math.round(stockData[0].open).toLocaleString()}원</td>
            <td>{Math.round(stockData[0].current_price).toLocaleString()}원</td>
            <td>{Math.round(stockData[0].high).toLocaleString()}원</td>
            <td>{Math.round(stockData[0].low).toLocaleString()}원</td>
            <td>{Math.round(stockData[0].volume).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ height: 300, marginTop: '3rem' }}>
        {chartData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-500">
            예측 데이터 없음
          </div>
        )}
      </div>
    </div>
  );
}
