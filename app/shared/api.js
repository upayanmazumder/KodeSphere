const API_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://api.ks.upayan.dev';

export default API_URL;