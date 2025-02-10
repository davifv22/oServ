import { Routes } from '@angular/router';
import { AuthGuard } from '../app/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component'

import { FuncionariosComponent } from './pages/cadastros/funcionarios/funcionarios.component'
import { ClientesComponent } from './pages/cadastros/clientes/clientes.component'
import { TipoRequerimentoComponent } from './pages/cadastros/tipo-requerimento/tipo-requerimento.component';
import { VeiculosComponent } from './pages/cadastros/veiculos/veiculos.component'
import { ServicosComponent } from './pages/cadastros/servicos/servicos.component'
import { PreOrcamentoComponent } from './pages/cadastros/pre-orcamento/pre-orcamento.component'

import { GestaoComponent } from './pages/gestao/gestao.component'
import { FinanceiroComponent } from './pages/financeiro/financeiro.component'
import { ParametrizacaoComponent } from './pages/parametrizacao/parametrizacao.component'
import { PerfilComponent } from './pages/perfil/perfil.component'




export const routes: Routes = [
  {path: '', component: HomeComponent, canActivate: [AuthGuard]},

  {path: 'cadastro/funcionarios', component: FuncionariosComponent, canActivate: [AuthGuard]},

  {path: 'cadastro/clientes', component: ClientesComponent, canActivate: [AuthGuard]},

  {path: 'cadastro/tipo-requerimento', component: TipoRequerimentoComponent, canActivate: [AuthGuard]},

  {path: 'cadastro/veiculos', component: VeiculosComponent, canActivate: [AuthGuard]},

  {path: 'cadastro/servicos', component: ServicosComponent, canActivate: [AuthGuard]},

  {path: 'cadastro/pre-orcamento', component: PreOrcamentoComponent, canActivate: [AuthGuard]},

  {path: 'gestao-oserv', component: GestaoComponent, canActivate: [AuthGuard]},

  {path: 'financeiro-oserv', component: FinanceiroComponent, canActivate: [AuthGuard]},

  {path: 'parametrizacao', component: ParametrizacaoComponent, canActivate: [AuthGuard]},

  {path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard]},

  {path: 'login', component: LoginComponent},

  {path: '**', component: LoginComponent}
];

