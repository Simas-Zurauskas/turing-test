import { client } from '../client';
import { ApiResponse, Message } from '../types';

// ----------------------------------------------------------------------------------------

type GetChat = (uxId: string) => Promise<ApiResponse<Message[]>>;

export const getChat: GetChat = (uxId) => {
  return client({
    url: `/chat`,
    method: 'GET',
  }).then((res) => res.data.data);
};

// ----------------------------------------------------------------------------------------

type SendChatMessage = (params: { id: string; message: string }) => Promise<ApiResponse<Message>>;

export const sendChatMessage: SendChatMessage = ({ id, ...data }) => {
  return client({
    url: `/chat`,
    method: 'POST',
    data,
  }).then((res) => res.data.data);
};

// ----------------------------------------------------------------------------------------
type LeaveFeedback = (params: {
  instanceUxId: string;
  messageId: string;
  feedback: 'negative' | 'positive' | null;
}) => Promise<ApiResponse<Message>>;

export const leaveFeedback: LeaveFeedback = ({ instanceUxId, messageId, ...data }) => {
  return client({
    url: `/instances/${instanceUxId}/chat/feedback/${messageId}`,
    method: 'PUT',
    data,
  }).then((res) => res.data.data);
};
