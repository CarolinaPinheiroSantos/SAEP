import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

function App({ currentUser, onLogout }) {
  const [view, setView] = useState('produtos')

  return (
    <div className="container">
      <header className="header">
        <h1>SAEP</h1>

        <nav>
          <button onClick={() => setView('produtos')}>Cadastro de Produto</button>
          <button onClick={() => setView('estoque')}>Gestão de Estoque</button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main>
        {view === 'produtos' && <Produtos api={API_BASE} />}
        {view === 'estoque' && <Estoque api={API_BASE} />}
      </main>
    </div>
  )
}

//
// ------------------------------------------
// POPUP COMPONENTE GENÉRICO
// ------------------------------------------
function Popup({ open, onClose, children }) {
  if (!open) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: 20,
        width: 400,
        borderRadius: 8,
        boxShadow: '0 0 20px rgba(0,0,0,0.3)'
      }}>
        {children}
        <div style={{ textAlign: 'right', marginTop: 10 }}>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

//
// ------------------------------------------
// CADASTRO DE PRODUTOS
// ------------------------------------------
function Produtos({ api }) {
  const [produtos, setProdutos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [openPopup, setOpenPopup] = useState(false)

  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    quantity: 0,
    min_quantity: 0
  })

  const fetchAll = (q) => {
    const url = q
      ? `${api}/products/?search=${encodeURIComponent(q)}`
      : `${api}/products/`

    axios.get(url)
      .then(r => setProdutos(r.data))
      .catch(() => setProdutos([]))
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const salvar = () => {
    if (!form.name) {
      alert('Nome obrigatório')
      return
    }

    const payload = {
      name: form.name,
      sku: form.sku || '',
      description: form.description || '',
      quantity: Number(form.quantity) || 0,
      min_quantity: Number(form.min_quantity) || 0
    }

    axios.post(`${api}/products/`, payload)
      .then(() => {
        fetchAll(searchTerm)
        setOpenPopup(false)
        setForm({
          name: '',
          sku: '',
          description: '',
          quantity: 0,
          min_quantity: 0
        })
      })
      .catch(e => {
        if (e.response && e.response.data)
          alert(JSON.stringify(e.response.data))
        else
          alert('Erro ao salvar')
      })
  }

  const remover = (id) => {
    if (!confirm('Confirma exclusão?')) return
    axios.delete(`${api}/products/${id}/`)
      .then(() => fetchAll(searchTerm))
  }

  const editar = (p) => {
    setForm({
      name: p.name,
      sku: p.sku || '',
      description: p.description || '',
      quantity: p.quantity || 0,
      min_quantity: p.min_quantity || 0,
      id: p.id
    })
    setOpenPopup(true)
  }

  const atualizar = () => {
    if (!form.id) return salvar()

    const payload = {
      name: form.name,
      sku: form.sku || '',
      description: form.description || '',
      quantity: Number(form.quantity) || 0,
      min_quantity: Number(form.min_quantity) || 0
    }

    axios.put(`${api}/products/${form.id}/`, payload)
      .then(() => {
        fetchAll(searchTerm)
        setOpenPopup(false)
        setForm({
          name: '',
          sku: '',
          description: '',
          quantity: 0,
          min_quantity: 0
        })
      })
      .catch(e => {
        if (e.response && e.response.data)
          alert(JSON.stringify(e.response.data))
        else
          alert('Erro ao atualizar')
      })
  }

  const doSearch = () => fetchAll(searchTerm)

  return (
    <div>
      <h2>Cadastro de Produto</h2>

      <button
        style={{ marginBottom: 10 }}
        onClick={() => {
          setForm({ name: '', sku: '', description: '', quantity: 0, min_quantity: 0 })
          setOpenPopup(true)
        }}
      >
        Adicionar
      </button>

      <div className="form">
        <div style={{ marginBottom: 8 }}>
          <input
            placeholder="Buscar"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button onClick={doSearch}>Buscar</button>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr><th>Nome</th><th>SKU</th><th>Qtde</th><th>Min</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {produtos.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{p.quantity}</td>
              <td>{p.min_quantity}</td>
              <td>
                <button onClick={() => editar(p)}>Editar</button>
                <button onClick={() => remover(p.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Popup open={openPopup} onClose={() => setOpenPopup(false)}>
        <h3>{form.id ? "Editar Produto" : "Novo Produto"}</h3>

        <input
          placeholder="Nome"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="SKU"
          value={form.sku}
          onChange={e => setForm({ ...form, sku: e.target.value })}
        />
        <input
          placeholder="Descrição"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Quantidade"
          value={form.quantity}
          onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Estoque mínimo"
          value={form.min_quantity}
          onChange={e => setForm({ ...form, min_quantity: parseInt(e.target.value) })}
        />

        <button onClick={form.id ? atualizar : salvar}>
          {form.id ? "Atualizar" : "Salvar"}
        </button>
      </Popup>
    </div>
  )
}

//
// ------------------------------------------
// ESTOQUE COM ALERTA FIXO NA TELA
// ------------------------------------------
function Estoque({ api }) {
  const [produtos, setProdutos] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [tipo, setTipo] = useState('entrada');
  const [quantidade, setQuantidade] = useState(0);
  const [dataMov, setDataMov] = useState('');
  const [alertasFixos, setAlertasFixos] = useState([]);

  const carregarProdutos = () => {
    axios.get(`${api}/products/`)
      .then(r => {
        setProdutos(r.data);

        const abaixo = r.data
          .filter(p => p.quantity < p.min_quantity)
          .map(p => `⚠️ Estoque do produto "${p.name}" está abaixo do mínimo!`);

        setAlertasFixos(abaixo);
      })
      .catch(() => setProdutos([]));
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const movimentar = () => {
    if (!selecionado) {
      setAlertasFixos(prev => [...prev, "Selecione um produto para movimentar."]);
      return;
    }

    const payload = {
      product: selecionado.id,
      movement_type: tipo === 'entrada' ? 'IN' : 'OUT',
      amount: Number(quantidade) || 0,
      notes: '',
      created_at: dataMov
        ? new Date(dataMov).toISOString()
        : new Date().toISOString()
    };

    axios.post(`${api}/movements/`, payload)
      .then(() => {
        carregarProdutos();
      })
      .catch(e => {
        setAlertasFixos(prev => [...prev,
          e.response?.data ? JSON.stringify(e.response.data) : 'Erro ao registrar movimentação.'
        ]);
      });
  };

  function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    const merged = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
      if ((left[i].name || '').toLowerCase() <= (right[j].name || '').toLowerCase()) {
        merged.push(left[i]); i++;
      } else {
        merged.push(right[j]); j++;
      }
    }
    return merged.concat(left.slice(i)).concat(right.slice(j));
  }

  const ordenados = mergeSort(produtos);

  return (
    <div>
      <h2>Gestão de Estoque</h2>

      {alertasFixos.length > 0 && (
        <div style={{
          background: '#ffe5e5',
          padding: '10px',
          border: '1px solid red',
          borderRadius: '5px',
          marginBottom: '10px',
          color: '#900',
          fontWeight: 'bold'
        }}>
          {alertasFixos.map((a, i) => (
            <div key={i}>{a}</div>
          ))}
        </div>
      )}

      <div className="estoque-controls">
        <select onChange={e => setSelecionado(JSON.parse(e.target.value))}>
          <option value="">-- selecione --</option>
          {produtos.map(p =>
            <option key={p.id} value={JSON.stringify(p)}>{p.name}</option>
          )}
        </select>

        <select value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>

        <input
          type="number"
          value={quantidade}
          onChange={e => setQuantidade(parseInt(e.target.value))}
          placeholder="Quantidade"
        />

        <input
          type="datetime-local"
          value={dataMov}
          onChange={e => setDataMov(e.target.value)}
        />

        <button onClick={movimentar}>Registrar</button>
      </div>

      <table className="table">
        <thead>
          <tr><th>Nome</th><th>SKU</th><th>Qtde</th><th>Min</th></tr>
        </thead>
        <tbody>
          {ordenados.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.sku || ''}</td>
              <td>{p.quantity}</td>
              <td>{p.min_quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
