import { Routes } from '@angular/router';

import { CustomersComponent } from './pages/customers.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DealsComponent } from './pages/deals.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'deals', component: DealsComponent },
  { path: '**', redirectTo: 'dashboard' }
];
