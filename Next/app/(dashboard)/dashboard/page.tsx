"use client"

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

const data=[
  {name:'Abertas',value:5},
  {name:'Em andamento',value:3},
  {name:'Finalizadas',value:8}
]

export default function Dashboard(){
  return(
    <div>
      <h2>Dashboard</h2>

      <div style={{display:'flex',gap:20}}>
        <div className="card p-3">Total OS: 16</div>
        <div className="card p-3">Abertas: 5</div>
        <div className="card p-3">Finalizadas: 8</div>
      </div>

      <div style={{display:'flex',gap:40,marginTop:30}}>
        <LineChart width={300} height={200} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" />
        </LineChart>

        <BarChart width={300} height={200} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </div>
    </div>
  )
}
