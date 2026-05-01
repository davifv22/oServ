export default function Planos() {
  return (
    <div className="container">
      <h2 className="mb-4">Escolha seu plano</h2>

      <div className="row">
        {[
          { name: 'Starter', price: '49,90', features: ['Até 2 usuários', 'Até 100 clientes'] },
          { name: 'Pro', price: '99,90', features: ['Até 10 usuários', 'Até 1000 clientes'] },
          { name: 'Enterprise', price: '199,90', features: ['Usuários ilimitados', 'Clientes ilimitados'] }
        ].map((plan, i) => (
          <div className="col-md-4" key={i}>
            <div className="card p-3">
              <h4>{plan.name}</h4>
              <h3>R$ {plan.price}/mês</h3>
              <ul>
                {plan.features.map((f, idx) => <li key={idx}>{f}</li>)}
              </ul>
              <a href={`/registro?plan=${plan.name}`} className="btn btn-primary">Contratar</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
