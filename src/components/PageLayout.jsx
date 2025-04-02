// 공통적으로 사용할 레이아웃
//지금은 네비게이션 바 위에 고정이라 padding만 추가해둠둠
// src/components/PageLayout.jsx
import React from 'react';

const PageLayout = ({ children }) => {
  return (
    <div style={{ paddingTop: '100px', padding: '20px' }}>
      {children}
    </div>
  );
};

export default PageLayout;
