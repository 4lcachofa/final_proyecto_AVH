import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';

import { LigasListComponent } from './features/ligas/ligas-list/ligas-list.component';
import { EquiposListComponent } from './features/equipos/equipos-list/equipos-list.component';
import { EntrenadoresListComponent } from './features/entrenadores/entrenadores-list/entrenadores-list.component';
import { JugadoresListComponent } from './features/jugadores/jugadores-list/jugadores-list.component';
import { StatsComponent } from './features/stats/stats/stats.component'

export const routes: Routes = [
  // auth screens (ya las tienes)
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },

  // app
  {
    path: 'app',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'ligas', component: LigasListComponent },
      { path: 'equipos', component: EquiposListComponent },
      { path: 'entrenadores', component: EntrenadoresListComponent },
      { path: 'jugadores', component: JugadoresListComponent },
      { path: 'stats', component: StatsComponent },

      // si ya tienes competencias:
      { path: 'competencias', loadComponent: () => import('./features/competencias/competencias-list/competencias-list.component').then(m => m.CompetenciasListComponent) },

      { path: '', pathMatch: 'full', redirectTo: 'ligas' },
    ],
  },

  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
