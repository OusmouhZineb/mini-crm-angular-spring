import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../api.service';
import { DashboardStats, Deal, Metric } from '../../models';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CHART_HEIGHT = 207;
const DONUT_RADIUS = 70;
const DONUT_LENGTH = 2 * Math.PI * DONUT_RADIUS;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  readonly donutRadius = DONUT_RADIUS;
  readonly donutLength = DONUT_LENGTH;

  stats = signal<DashboardStats | null>(null);
  deals = signal<Deal[]>([]);
  error = signal('');

  query = signal('');
  period = signal(30);
  selectedMonth = signal(new Date().getMonth() + 1);

  bars = computed(() => {
    const monthly = this.stats()?.monthlyRevenue ?? [];
    const max = Math.max(1, ...monthly.map(m => m.amount));
    const total = monthly.reduce((sum, m) => sum + m.amount, 0);
    return monthly.map(m => ({
      month: m.month,
      label: MONTHS[m.month - 1],
      height: Math.max(8, Math.round((m.amount / max) * CHART_HEIGHT)),
      share: total ? Math.round((m.amount / total) * 100) : 0
    }));
  });

  selectedBar = computed(() => this.bars().find(b => b.month === this.selectedMonth()));

  donutOffset = computed(() => DONUT_LENGTH * (1 - (this.stats()?.customers.newPercent ?? 0) / 100));

  filteredDeals = computed(() => {
    const q = this.query().trim().toLowerCase();
    const days = this.period();
    const cutoff = days ? Date.now() - days * 86_400_000 : 0;
    return this.deals()
      .filter(d => new Date(d.createdAt).getTime() >= cutoff)
      .filter(d => !q || `${d.title} ${d.customerName} ${d.description}`.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

  ngOnInit(): void {
    this.api.dashboard().subscribe({
      next: s => this.stats.set(s),
      error: () => this.error.set('Cannot reach the API. Is the Spring Boot backend running on port 8080?')
    });
    this.api.deals().subscribe({ next: d => this.deals.set(d), error: () => undefined });
  }

  compact(value: number): string {
    return value >= 1000 ? `$${(value / 1000).toFixed(value >= 100_000 ? 0 : 1)}k` : `$${value}`;
  }

  trendClass(m: Metric): string {
    return m.changePercent >= 0 ? 'up' : 'down';
  }

  initials(name: string): string {
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }
}
