import React, { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

export default function Login({ onLogin }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e && e.preventDefault()
    setError(null)
    if(!username || !password){ setError('Usuário e senha são obrigatórios'); return }
    setLoading(true)
    try{
      const resp = await axios.post(`${API_BASE}/token/`, { username, password })
      const { access, refresh } = resp.data
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      // fetch current user
      const me = await axios.get(`${API_BASE}/me/`)
      onLogin(me.data)
    }catch(err){
      let msg = 'Erro ao autenticar'
      if(err.response && err.response.data){
        msg = JSON.stringify(err.response.data)
      }
      setError(msg)
      setPassword('')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h2>Entrar</h2>
      <form onSubmit={submit} className="form">
        <input placeholder="Usuário" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
        <div style={{marginTop:8}}>
          <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </div>
        {error && <div className="error" style={{color:'red',marginTop:8}}>{error}</div>}
      </form>
    </div>
  )
}
