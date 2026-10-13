import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  nav = [
    { path: '/dashboard', label: 'Dashboard', icon: 'assets/icons/nav-dashboard.svg' },
    { path: '/customers', label: 'Customers', icon: 'assets/icons/nav-customers.svg' },
    { path: '/deals', label: 'Deals', icon: 'assets/icons/nav-income.svg' }
  ];
}
