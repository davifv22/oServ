import { Button } from '@/components/ui/button'

export default function Planos() {
  return (
    <div className="container">
      <h2 className="mb-4">Escolha seu plano</h2>

      <div className="row">
        {[
          { id: 'STARTER', name: 'Starter', price: '49,90', features: ['Ate 2 usuarios', 'Ate 100 clientes'] },
          { id: 'PRO', name: 'Pro', price: '99,90', features: ['Ate 10 usuarios', 'Ate 1000 clientes'] },
          { id: 'ENTERPRISE', name: 'Enterprise', price: '199,90', features: ['Usuarios ilimitados', 'Clientes ilimitados'] }
        ].map((plan, i) => (
          <div className="col-md-4" key={i}>
            <div className="card p-3">
              <h4>{plan.name}</h4>
              <h3>R$ {plan.price}/mes</h3>
              <ul>
                {plan.features.map((f, idx) => <li key={idx}>{f}</li>)}
              </ul>
              <Button className="bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" asChild>
                <a href={`/registro?plan=${plan.id}`}>Contratar</a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
