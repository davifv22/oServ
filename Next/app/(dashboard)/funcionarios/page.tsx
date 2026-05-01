"use client"

import { useEffect, useState } from 'react'

export default function Funcionarios() {
  const [list,setList]=useState<any[]>([])
  const [form,setForm]=useState<any>({})

  async function load(){
    const r=await fetch('/api/employees')
    setList(await r.json())
  }

  useEffect(()=>{load()},[])

  async function save(e:any){
    e.preventDefault()

    await fetch('/api/employees',{
      method: form.id?'PATCH':'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(form)
    })

    setForm({})
    load()
  }

  async function remove(id:string){
    await fetch(`/api/employees?id=${id}`,{method:'DELETE'})
    load()
  }

  return(
    <div>
      <h2>Funcionários</h2>

      <form onSubmit={save} className="card p-3 mb-3">
        <div className="row g-2">
          <input placeholder="Nome" className="form-control" onChange={e=>setForm({...form,name:e.target.value})}/>
          <input placeholder="Email" className="form-control" onChange={e=>setForm({...form,email:e.target.value})}/>
          <input placeholder="Telefone" className="form-control" onChange={e=>setForm({...form,phone:e.target.value})}/>
          <input placeholder="Cargo" className="form-control" onChange={e=>setForm({...form,position:e.target.value})}/>
          <label><input type="checkbox" onChange={e=>setForm({...form,hasAccess:e.target.checked})}/> Acesso ao sistema</label>
          <button className="btn btn-primary">Salvar</button>
        </div>
      </form>

      {list.map(f=>(
        <div key={f.id} className="card p-2 mb-2">
          <strong>{f.name}</strong>
          <div>{f.email}</div>
          <button onClick={()=>remove(f.id)} className="btn btn-sm btn-danger">Excluir</button>
        </div>
      ))}
    </div>
  )
}
