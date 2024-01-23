import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component'
import { AuthGuard } from '../app/guards/auth.guard';

export const routes: Routes = [{
  path: '',
  component: HomeComponent, canActivate: [AuthGuard]
},
{
  path: 'login',
  component: LoginComponent
},
{
  path: '**',
  component: LoginComponent
}
];
