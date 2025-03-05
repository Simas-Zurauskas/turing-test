import { useMemo } from 'react';
import { slice } from '../reducers/auth';
import { bindActionCreators } from 'redux';
import { useStateDispatch } from '../store';

const useActionsAuth = () => {
  const { actions } = slice;
  const dispatch = useStateDispatch();

  return useMemo(() => bindActionCreators(actions, dispatch), [actions, dispatch]);
};

export default useActionsAuth;
