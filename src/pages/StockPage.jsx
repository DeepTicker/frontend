import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StockPage.css";

export default function StockTable() {
  const [stocksData, setStocksData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const stocksPerPage = 20;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:10000/api/stocks");
        const data = await res.json();
        setStocksData(data);
      } catch (error) {
        console.error("Error fetching stocks:", error);
      }
    };

    fetchData();
  }, []);

  const totalPages = Math.ceil(stocksData.length / stocksPerPage);
  const startIndex = (currentPage - 1) * stocksPerPage;
  const endIndex = startIndex + stocksPerPage;
  const currentStocks = stocksData.slice(startIndex, endIndex);
  const pagesPerGroup = 10;
  const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
  const groupStartPage = currentGroup * pagesPerGroup + 1;
  const groupEndPage = Math.min(groupStartPage + pagesPerGroup - 1, totalPages);
  const pageNumbers = [];
  for (let i = groupStartPage; i <= groupEndPage; i++) {
    pageNumbers.push(i);
  }

  
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


  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  return (
    <div className="stocks-table-container">
      <h1 className="stocks-table-title">오늘의 주식 차트</h1>
      <div className="stocks-table-wrapper">
        <table className="stocks-table">
          <thead>
            <tr>
                <th className="px-6 py-3" style={{ width: "40%" }}>종목</th>
                <th className="px-6 py-3" style={{ width: "15%" }}>현재가</th>
                <th className="px-6 py-3" style={{ width: "15%" }}>등락률</th>
                <th className="px-6 py-3" style={{ width: "15%" }}>시가총액</th>
                <th className="px-6 py-3" style={{ width: "15%" }}>거래량</th>
            </tr>
          </thead>
          <tbody>
            {currentStocks.map((stock) => {
              const rate = parseFloat(stock.change_rate);
              const rateFormatted = `${rate > 0 ? "+" : ""}${rate.toFixed(2)}%`; 
              let rateClass = "gray";
              if (rate > 0) rateClass = "red";
              else if (rate < 0) rateClass = "blue";

              return (
                <tr
                  key={stock.stock_id}
                  onClick={() =>
                    navigate(`./${encodeURIComponent(stock.stock_id)}`)
                  }
                >
                  <td className="stocks-name-col">{stock.name}</td>
                  <td>{Number(stock.current_price).toLocaleString()}원</td>
                  <td className={rateClass}>{rateFormatted}</td>
                  <td>{formatMarketCap(stock.market_cap)}</td> {/* ← 여기 수정 */}
                  <td>{Number(stock.volume).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(groupStartPage - 1)}
          disabled={groupStartPage === 1}
          className="pagination-nav"
        >
          이전
        </button>

        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`pagination-number ${pageNum === currentPage ? "active-page" : ""}`}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(groupEndPage + 1)}
          disabled={groupEndPage >= totalPages}
          className="pagination-nav"
        >
          다음
        </button>
      </div>
    </div>
  );
}
