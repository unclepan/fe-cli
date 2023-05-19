import axios from 'axios';

const BASE_URL = 'http://book.youbaobao.xyz:7002';

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

service.interceptors.request.use(
  config => config,
  error => Promise.reject(error),
);

service.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error),
);

export default service;
