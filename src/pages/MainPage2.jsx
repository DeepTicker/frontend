import React, { useEffect, useState } from 'react';
import './MainPage2.css';
import {Line} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Pagination } from 'swiper/modules';
import 'swiper/css/pagination';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip, Legend, TimeScale);

// // 수평선 플러그인 (기존 그대로)
// const createCurrentPricePlugin = (basePrice) => ({
//   id: 'basePriceLine',
//   beforeDraw: (chart) => {
//     if (!basePrice) return;
//     const { ctx, chartArea, scales } = chart;
//     const y = scales.y.getPixelForValue(basePrice);
//     ctx.save();
//     ctx.beginPath();
//     ctx.moveTo(chartArea.left, y);
//     ctx.lineTo(chartArea.right, y);
//     ctx.lineWidth = 1.5;
//     ctx.strokeStyle = '#2c3e50';
//     ctx.setLineDash([5, 5]);
//     ctx.stroke();
//     ctx.restore();
//   }
// });

const MainPage2 = () => {
  const [chartDataList, setChartDataList] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animateIndex, setAnimateIndex] = useState(null);

  const fetchGeminiData = async (stockId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/stocks/${stockId}/gemini`);
      const data = await res.json();
      return data.phrase;
    } catch (err) {
      console.error('Gemini 데이터 불러오기 실패:', err);
      return 'Gemini 응답을 가져올 수 없습니다.';
    }
  };
  const getGradient = (ctx, chartArea, color) => {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);

    if (color === 'red') {
      // gradient.addColorStop(0, 'rgba(255, 0, 0, 0.2)');  // 선 바로 아래는 진한 빨강
      gradient.addColorStop(0.1, 'rgba(234, 67, 53,0.3)'); // 중간쯤에서 희미하게
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)'); // 완전 아래는 흰색
    } else {
      // gradient.addColorStop(0, 'rgba(0, 0, 255, 0.4)');   // 선 바로 아래는 진한 파랑
      gradient.addColorStop(0.1, 'rgba(66, 133, 244, 0.3)'); // 중간쯤에서 희미하게
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)'); // 완전 아래는 흰색
    }

    return gradient;
  };
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stocks/forMain');
        const data = await res.json();

        const stockKeys = Object.keys(data).slice(0, 5);

        const processedData = await Promise.all(
          stockKeys.map(async (key) => {
            const { name, volume, predictions } = data[key];

            // labels는 날짜 문자열, 'yyyy-MM-dd' 가정
            const labels = getLastMonthLabels();
            const predictedData = predictions.map(item => item.predicted_close);

            const basePrice = predictedData[0]; // 첫날 기준
            const lastPrice = predictedData[predictedData.length - 1];

            // 빨강 / 파랑 영역 데이터 준비
            const redArea = [];
            const blueArea = [];

            predictedData.forEach(value => {
              if (lastPrice > basePrice) {
                // 상승 시 빨강 영역 채우기 (기준선 아래는 basePrice로 고정)
                if (value >= basePrice) {
                  redArea.push(value);
                  blueArea.push(basePrice);
                } else {
                  blueArea.push(value);
                  redArea.push(basePrice);
                }
              } else {
                // 하락 시 파랑 영역 채우기 (기준선 위는 basePrice로 고정)
                if (value <= basePrice) {
                  blueArea.push(value);
                  redArea.push(basePrice);
                } else {
                  redArea.push(value);
                  blueArea.push(basePrice);
                }
              }
            });

            const geminiResponse = await fetchGeminiData(key);

            return {
              stockId: key,
              name,
              volume,
              basePrice,
              chartData: {
                labels,
                datasets: [
                  {
                    label: 'Predicted',
                    data: predictedData,
                    borderColor: 'red',
                    pointBorderColor: 'red',
                    pointRadius: 3,
                    // backgroundColor: 'rgba(255, 0, 0, 0.2)'
                  },
                  // {
                  //   label: 'Above Base',
                  //   data: redArea,
                  //   backgroundColor: 'rgba(255, 0, 0, 0.2)',
                  //   borderColor: 'rgba(255, 0, 0, 0.2)',
                  //   borderWidth: 1,
                  //   pointRadius: 0,
                  //   fill: +1,
                  // },
                  // {
                  //   label: 'Below Base',
                  //   data: blueArea,
                  //   backgroundColor: 'rgba(0, 0, 255, 0.2)',
                  //   borderColor: 'rgba(0, 0, 255, 0.2)',
                  //   borderWidth: 1,
                  //   pointRadius: 0,
                  //   fill: true,
                  // }
                ]              
              },
              geminiDescription: geminiResponse
            };
          })
        );

        setChartDataList(processedData);
      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
      }
    };

    fetchData();
  }, []);

  const formatVolume = (vol) => vol.toLocaleString();

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.activeIndex);
    setAnimateIndex(null);
    setTimeout(() => {
      setAnimateIndex(swiper.activeIndex);
    }, 10);
  };

  return (
    <div className="stock-container">
      <Swiper
        spaceBetween={50}
        slidesPerView={1}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        onSlideChange={handleSlideChange}
      >
        {chartDataList.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="slide-content">
              <div className="slide-header">
                <h2>Today's Highest Trading Volume</h2>
              </div>
              <div className="left-pane">
                <h2 className="volume-info">
                  {index + 1}. {item.name} <br />
                  ({formatVolume(item.volume)}건)
                </h2>
                <div className="chat-bubble-container">
                  <div className="chat-bubble-right">
                    {item.name} 주가 앞으로 어떤가요?
                  </div>
                  <div className="chat-bubble">
                    {item.geminiDescription}
                  </div>
                </div>
              </div>
              <div className="right-pane">
                <div className="chart-wrapper">                
                  <Line
                    data={{
                      labels: item.chartData.labels,
                      datasets: [
                        {
                          label: 'Predicted',
                          data: item.chartData.datasets[0].data,
                          borderColor: item.basePrice < item.chartData.datasets[0].data.at(-1)
                            ? 'rgb(234, 67, 53)'
                            : 'rgb(66, 133, 244)',
                          backgroundColor: (context) => {
                            const { chart } = context;
                            const { ctx, chartArea } = chart;
                            if (!chartArea) return null; // chartArea는 처음엔 undefined일 수 있음

                            return getGradient(ctx, chartArea, item.basePrice < item.chartData.datasets[0].data.at(-1) ? 'red' : 'blue');
                          },
                          fill: true,
                          pointRadius: 1.5,
                          borderWidth: 1.5,
                        }, 
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          type: 'time',
                          time: {
                            parser: 'yyyy-MM-dd',
                            unit: 'day',
                            displayFormats: {
                              day: 'M/d'
                            }
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
                            text: 'Price (KRW)'
                          }
                        }
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const value = context.parsed.y?.toFixed(0);
                              const date = new Date(context.label);
                              return `금액: ${value} KRW`;
                            }
                          }
                        }
                      },
                      interaction: {
                        mode: 'nearest',
                        intersect: true,
                      }
                    }}
                    // plugins={[
                    //   //createBasePricePlugin(item.basePrice),
                    //   gradientBackgroundPlugin(item.basePrice < item.chartData.datasets[0].data.at(-1))
                    // ]}
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MainPage2;
