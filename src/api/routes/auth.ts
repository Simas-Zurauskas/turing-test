import { client } from '../client';
import { ApiResponse } from '../types';

type Auth = (email: string) => Promise<ApiResponse<string>>;

export const auth: Auth = (email) => {
  return client({
    url: `/auth`,
    method: 'POST',
    data: { email },
  }).then((res) => res.data.data);
};

// ----------------------------------------------------------------------------------------
