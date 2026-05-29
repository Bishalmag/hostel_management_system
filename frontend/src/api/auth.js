import api from './axios';

export const loginUser = (email, password) =>
  api.post('/users/auth/login/', { email, password });

export const registerUser = (data) =>
  api.post('users/auth/register/', data);

export const getMe = () =>
  api.get('/users/auth/me/');