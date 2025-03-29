import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://api.ks.upayan.dev';

console.log("API URL:", API_URL);

export default API_URL;