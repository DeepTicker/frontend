import React from 'react';

const StockPreview = () => {
  // 임시 데이터
  const dummyStocks = [
    { code: '005930', name: '삼성전자', price: '70,000원' },
    { code: '035720', name: '카카오', price: '56,000원' },
    { code: '000660', name: 'SK하이닉스', price: '120,500원' },
    { code: '051910', name: 'LG화학', price: '710,000원' },
    { code: '035420', name: 'NAVER', price: '215,000원' },
    { code: '207940', name: '삼성바이오로직스', price: '812,000원' }
  ];

  return (
    <ul className="stock-list">
      {dummyStocks.map((stock, index) => (
        <li key={`${stock.code}-${index}`} className="stock-item">
          <span className="stock-name">{stock.name}</span>
          <span className="stock-price">{stock.price}</span>
        </li>
      ))}
    </ul>
  );
};

export default StockPreview;
