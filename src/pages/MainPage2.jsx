import React, { useEffect, useState } from 'react';
import './MainPage2.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Pagination } from 'swiper/modules';
import 'swiper/css/pagination';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const MainPage2 = () => {
  const [chartDataList, setChartDataList] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animateIndex, setAnimateIndex] = useState(null);

  // useEffect(() => {
  //   fetch('http://localhost:5000/api/stocks/forMain')
  //     .then((res) => res.json())
  //     .then((data) => {
  //       const stockKeys = Object.keys(data).slice(0, 5); // 최대 5개 종목
  //       const processedData = stockKeys.map((key) => {
  //         const { name, volume, predictions } = data[key];
  //         const labels = predictions.map(item => item.predict_day);
  //         const dataset = predictions.map(item => item.predicted_close);

  //         return {
  //           stockId: key,
  //           name,
  //           volume,
  //           chartData: {
  //             labels,
  //             datasets: [
  //               {
  //                 label: `${name} 예측 주가`,
  //                 data: dataset,
  //                 borderColor: 'blue',
  //                 fill: false
  //               }
  //             ]
  //           }
  //         };
  //       });
  //       setChartDataList(processedData);
  //     })
  //     .catch((err) => console.error('데이터 불러오기 실패:', err));
  // }, []);

  const fetchGeminiData = async (stockId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/stocks/${stockId}/gemini`);
      const data = await res.json();
      return data.response; // 또는 data.catchphrase 등 API 응답 형태에 따라 조정
    } catch (err) {
      console.error('Gemini 데이터 불러오기 실패:', err);
      return 'Gemini 응답을 가져올 수 없습니다.';
    }
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
            const labels = predictions.map(item => item.predict_day);
            const dataset = predictions.map(item => item.predicted_close);

            const geminiResponse = await fetchGeminiData(key); // ✅ async 안이므로 OK

            return {
              stockId: key,
              name,
              volume,
              chartData: {
                labels,
                datasets: [
                  {
                    label: `${name} 예측 주가`,
                    data: dataset,
                    borderColor: 'blue',
                    fill: false
                  }
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

    fetchData(); // useEffect 안에서 async 함수 호출
  }, []);

  const formatVolume = (vol) => vol.toLocaleString();  // 천 단위 콤마
  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.activeIndex);
    setAnimateIndex(null); // 초기화 후
    setTimeout(() => {
      setAnimateIndex(swiper.activeIndex); // 짧은 시간 후 애니메이션 클래스 부여
    }, 10);
  };

  return (
    <div className="stock-container">      
      {/* <h1 className="page-title">DeepTicker</h1> */}
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
              {/* <div className="slide-header">
                <p className="volume-info">
                  Today's Highest Trading Volume<br />
                  Top {index + 1} - {item.name} ({formatVolume(item.volume)}건)
                </p>
              </div>            */}
              <div className="left-pane">
                <h2 className="volume-info">
                  {/* Today's Highest Trading Volume<br /> */}
                  {index + 1}. {item.name} <br />
                  ({formatVolume(item.volume)}건)
                </h2>
                {/* <h2>{item.name} 정보</h2> */}
                <p>{item.name}에 대한 자세한 설명 또는 개요를 여기에 작성할 수 있습니다.</p>
                <p>{item.geminiDescription}</p>
              </div>
              <div className="right-pane">
                <div className="chart-header">
                  {/* <h2>주가 그래프 </h2> */}
                  {/* <h3 className="volume-info">{formatVolume(item.volume)}건</h3> */}
                </div>
                <div className="chart-wrapper">
                  <Line
                    data={item.chartData}
                    options={{ responsive: true, maintainAspectRatio: false }}
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
