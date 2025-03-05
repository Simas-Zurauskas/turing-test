import { Scenario, ScenarioInput } from '@/lib/mongo/models/ScenarioModel';
import { client } from '../client';
import { ApiResponse } from '../types';

type CreateScenario = (
  scenario: Omit<ScenarioInput, 'controls' | 'assessment' | 'user'>,
) => Promise<ApiResponse<Scenario>>;

export const createScenario: CreateScenario = (scenario) => {
  return client({
    url: `/scenario`,
    method: 'POST',
    data: scenario,
  }).then((res) => res.data.data);
};
// ----------------------------------------------------------------------------------------

type GetScenarios = () => Promise<ApiResponse<Scenario[]>>;

export const getScenarios: GetScenarios = () => {
  return client({
    url: `/scenario`,
    method: 'GET',
  }).then((res) => res.data.data);
};
// ----------------------------------------------------------------------------------------

type GetScenario = (id: string) => Promise<ApiResponse<Scenario>>;

export const getScenario: GetScenario = (id) => {
  return client({
    url: `/scenario/${id}`,
    method: 'GET',
  }).then((res) => res.data.data);
};
// ----------------------------------------------------------------------------------------

type DeleteScenario = (id: string) => Promise<ApiResponse<void>>;

export const deleteScenario: DeleteScenario = (id) => {
  return client({
    url: `/scenario/${id}`,
    method: 'DELETE',
  }).then((res) => res.data.data);
};
// ----------------------------------------------------------------------------------------

type GenerateScenario = () => Promise<ApiResponse<{ name: string; description: string }>>;

export const generateScenario: GenerateScenario = () => {
  return client({
    url: `/scenario/generate`,
    method: 'GET',
  }).then((res) => res.data.data);
};
// ----------------------------------------------------------------------------------------

type GenerateAssessment = (id: string) => Promise<ApiResponse<void>>;

export const generateAssessment: GenerateAssessment = (id) => {
  return client({
    url: `/scenario/${id}/assessment`,
    method: 'POST',
  }).then((res) => res.data.data);
};
// ----------------------------------------------------------------------------------------

type UploadFiles = (params: { id: string; files: File[] }) => Promise<ApiResponse<void>>;

export const uploadFiles: UploadFiles = async ({ id, files }) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return client({
    url: `/scenario/${id}/files`,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((res) => res.data.data);
};
// ----------------------------------------------------------------------------------------

type DeleteFile = (params: { id: string; fileId: string }) => Promise<ApiResponse<void>>;

export const deleteFile: DeleteFile = async ({ id, fileId }) => {
  return client({
    url: `/scenario/${id}/files/${fileId}`,
    method: 'DELETE',
  }).then((res) => res.data.data);
};
// ----------------------------------------------------------------------------------------
