
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App'
import Login from './Login'
import './styles.css'
import { setAuthHeader, logout as doLogout } from './auth'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

function Root(){
	const [user, setUser] = useState(null)

	useEffect(()=>{
		setAuthHeader()
		const token = localStorage.getItem('access_token')
		if(token){
			axios.get(`${API_BASE}/me/`).then(r=> setUser(r.data)).catch(()=>{ doLogout(); setUser(null) })
		}
	},[])

	const handleLogin = (userData) => setUser(userData)
	const handleLogout = () => { doLogout(); setUser(null) }

	return (
		<React.StrictMode>
			{user ? <App currentUser={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
		</React.StrictMode>
	)
}

createRoot(document.getElementById('root')).render(<Root />)
