'use client';
import React from 'react';
import styled from '@emotion/styled';
import Aside from '@/components/Aside/Aside';

const Div = styled.div`
  height: 100vh;
  position: relative;
  display: grid;
  grid-template-columns: 200px 1fr;

  main {
    height: 100%;
    flex: 1;
    overflow-y: auto;
  }
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Div>
      <Aside />
      <main>{children}</main>
    </Div>
  );
};

export default Layout;
