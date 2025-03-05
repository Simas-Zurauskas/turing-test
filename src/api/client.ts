import { store } from '@/state';
import axios from 'axios';

export const client = axios.create({
  baseURL: `/api`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (request) => {
  if (request.headers) {
    request.headers.set('Authorization', `Bearer ${store.getState().auth.user?.email}`);
  }

  return request;
});

client.interceptors.response.use(
  (response) => response,
  (err) => {
    return Promise.reject(err.response?.data as { message: string });
  },
);
