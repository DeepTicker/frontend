import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StockTable() {
  const [stocksData, setStocksData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stocks");
        const data = await res.json();
        setStocksData(data);
      } catch (error) {
        console.error("Error fetching stocks:", error);
      }
    };
  
    fetchData();
  }, []);
  

  return (
    <div className="p-6 space-y-4 mt-16">
      <div className="p-4 mt-4 border rounded shadow-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="border-b px-4 py-2 text-left">종목명</th>
              <th className="border-b px-4 py-2 text-left">현재가</th>
              <th className="border-b px-4 py-2 text-left">등락률 (%)</th>
              <th className="border-b px-4 py-2 text-left">시가총액</th>
              <th className="border-b px-4 py-2 text-left">거래량</th>
            </tr>
          </thead>
          <tbody>
            {stocksData.map((stock) => (
              <tr
                key={stock.stock_id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`./${encodeURIComponent(stock.stock_id)}`)}
              >
                <td className="border-b px-4 py-2">{stock.name}</td>
                <td className="border-b px-4 py-2">{Number(stock.current_price).toLocaleString()}원</td>
                <td className="border-b px-4 py-2">{stock.change_rate}%</td>
                <td className="border-b px-4 py-2">{Number(stock.market_cap).toLocaleString()}</td>
                <td className="border-b px-4 py-2">{Number(stock.volume).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
