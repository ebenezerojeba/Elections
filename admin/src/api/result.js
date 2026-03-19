import api from './axios.js';

export const submitResult = async (formData) => {
  const { data } = await api.post('/results', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getResults = async (page = 1, limit = 50) => {
  const { data } = await api.get(`/results?page=${page}&limit=${limit}`);
  return data;
};

export const getSummary = async () => {
  const { data } = await api.get('/results/summary');
  return data;
};

export const getResultById = async (id) => {
  const { data } = await api.get(`/results/${id}`);
  return data;
};