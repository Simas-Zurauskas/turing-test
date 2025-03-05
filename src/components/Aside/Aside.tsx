import styled from '@emotion/styled';
import { NavItem } from './comps';

const Div = styled.div`
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.appBgBack};
  color: ${({ theme }) => theme.colors.textWhite};
  display: flex;
  flex-direction: column;
`;

interface AsideProps {}

const Aside: React.FC<AsideProps> = () => {
  return (
    <Div>
      <NavItem path="/" pathRegex={[/^\/$/]} title="Index" />
    </Div>
  );
};

export default Aside;
