import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

export function setAuthHeader(){
  const token = localStorage.getItem('access_token')
  if(token){
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

export function logout(){
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  setAuthHeader()
}

export default {
  API_BASE,
  setAuthHeader,
  logout,
}
