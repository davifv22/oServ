import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const plans = [
  { id: 'STARTER', name: 'Starter', price: '49,90', features: ['Ate 2 usuarios', 'Ate 100 clientes'] },
  { id: 'PRO', name: 'Pro', price: '99,90', features: ['Ate 10 usuarios', 'Ate 1000 clientes'] },
  { id: 'ENTERPRISE', name: 'Enterprise', price: '199,90', features: ['Usuarios ilimitados', 'Clientes ilimitados'] }
]

export default function Planos() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h2 className="text-3xl font-bold">Escolha seu plano</h2>
        <p className="text-muted-foreground mt-1">Plano ideal para escalar sua operacao com oServ.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {plans.map(plan => (
          <Card key={plan.id} className="border-app-border">
            <CardHeader className="space-y-1">
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-3xl font-bold">R$ {plan.price}<span className="text-sm font-medium text-muted-foreground">/mes</span></p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                {plan.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <Button className="w-full bg-app-accent hover:bg-app-accent/80 text-white border-app-accent" asChild>
                <a href={`/registro?plan=${plan.id}`}>Contratar</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  )
}
