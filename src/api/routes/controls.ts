import { client } from '../client';
import { ApiResponse } from '../types';
import { Control, ControlInput } from '@/lib/mongo/models/ControlModel';

type CreateControls = (controls: ControlInput[]) => Promise<ApiResponse<null>>;

export const createControls: CreateControls = (data) => {
  return client({
    url: `/control`,
    method: 'POST',
    data,
  }).then((res) => res.data.data);
};
// ----------------------------------------------------------------------------------------

type GetControls = (isPrivate: boolean) => Promise<ApiResponse<Control[]>>;

export const getControls: GetControls = (isPrivate) => {
  return client({
    url: `/control`,
    method: 'GET',
    params: { isPrivate },
  }).then((res) => res.data.data);
};
// ----------------------------------------------------------------------------------------

type DeleteControl = (id: string) => Promise<ApiResponse<void>>;

export const deleteControl: DeleteControl = (id) => {
  return client({
    url: `/control/${id}`,
    method: 'DELETE',
  }).then((res) => res.data.data);
};
// ----------------------------------------------------------------------------------------
