import React, { useState } from 'react';
import styled from '@emotion/styled';

const TooltipContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const TooltipIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #6c757d;
  color: white;
  font-size: 10px;
  margin-left: 4px;
  cursor: help;
`;

const TooltipContent = styled.div<{ visible: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  width: 220px;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 100;
  margin-bottom: 8px;
  text-align: left;
  font-weight: normal;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
`;

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <TooltipContainer>
      {children}
      <TooltipIcon onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
        ?
      </TooltipIcon>
      <TooltipContent visible={visible}>{text}</TooltipContent>
    </TooltipContainer>
  );
};
