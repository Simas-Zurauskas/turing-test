import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface State {
  user: null;
}

const initialState: State = {
  user: null,
};

export const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<null>) => {
      state.user = action.payload;
    },
  },
});

export default slice.reducer;
