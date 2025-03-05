import styled from '@emotion/styled';
import { usePathname, useRouter } from 'next/navigation';
import { css } from '@emotion/react';
const Div = styled.div<{ isActive: boolean }>`
  padding: 6px 10px;
  border-radius: 5px;
  /* background-color: ${({ isActive }) => (isActive ? 'lightgray' : 'transparent')}; */
  cursor: pointer;
  margin-bottom: 10px;

  ${({ isActive }) =>
    isActive &&
    css`
      font-weight: 600;
      backdrop-filter: grayscale(20%);
      outline: 1px solid gray;
    `}

  &:hover {
    outline: 1px solid darkgray;
  }
`;

interface NavItemProps {
  title: string;
  path: string;
  pathRegex: RegExp[];
}

export const NavItem: React.FC<NavItemProps> = ({ title, path, pathRegex }) => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = pathRegex.some((regex) => regex.test(pathname));

  return (
    <Div onClick={() => router.push(path)} isActive={isActive}>
      {title}
    </Div>
  );
};
