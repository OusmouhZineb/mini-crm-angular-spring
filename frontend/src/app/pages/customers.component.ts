import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../api.service';
import { CUSTOMER_STATUSES, Customer } from '../models';

const blank = (): Customer => ({ name: '', email: '', phone: '', company: '', status: 'LEAD' });

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <header class="page-head">
      <h1>Customers</h1>
      <div class="toolbar">
        <label class="search white">
          <img src="assets/icons/search.svg" alt="" width="24" height="24" />
          <input type="search" placeholder="Search" [ngModel]="query()" (ngModelChange)="query.set($event)" />
        </label>
        <button class="btn" (click)="edit(null)">+ Add customer</button>
      </div>
    </header>

    @if (error()) {
      <div class="error">{{ error() }}</div>
    }

    <section class="card">
      <div class="table-wrap">
        <table class="data">
          <thead>
            <tr><th>Name</th><th>Company</th><th>Phone</th><th>Status</th><th>Since</th><th></th></tr>
          </thead>
          <tbody>
            @for (c of filtered(); track c.id) {
              <tr>
                <td>
                  <div class="cell-flex">
                    <span class="avatar">{{ initials(c.name) }}</span>
                    <div>
                      <div class="primary">{{ c.name }}</div>
                      <div class="secondary">{{ c.email }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ c.company }}</td>
                <td>{{ c.phone }}</td>
                <td><span class="badge" [class]="'badge ' + c.status">{{ c.status }}</span></td>
                <td>{{ c.createdAt | date: 'mediumDate' }}</td>
                <td>
                  <div class="actions">
                    <button class="btn ghost small" (click)="edit(c)">Edit</button>
                    <button class="btn danger small" (click)="remove(c)">Delete</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="empty">No customers found.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    @if (form(); as f) {
      <div class="backdrop" (click)="form.set(null)">
        <form class="modal" (click)="$event.stopPropagation()" (ngSubmit)="save()">
          <h2>{{ f.id ? 'Edit customer' : 'New customer' }}</h2>
          <label>Name <input name="name" [(ngModel)]="f.name" required /></label>
          <label>Email <input name="email" type="email" [(ngModel)]="f.email" /></label>
          <div class="row">
            <label>Phone <input name="phone" [(ngModel)]="f.phone" /></label>
            <label>Company <input name="company" [(ngModel)]="f.company" /></label>
          </div>
          <label>Status
            <select name="status" [(ngModel)]="f.status">
              @for (s of statuses; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
          </label>
          <div class="footer">
            <button type="button" class="btn ghost" (click)="form.set(null)">Cancel</button>
            <button type="submit" class="btn" [disabled]="!f.name.trim()">Save</button>
          </div>
        </form>
      </div>
    }
  `
})
export class CustomersComponent implements OnInit {
  private api = inject(ApiService);

  readonly statuses = CUSTOMER_STATUSES;

  customers = signal<Customer[]>([]);
  query = signal('');
  form = signal<Customer | null>(null);
  error = signal('');

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.customers().filter(
      c => !q || `${c.name} ${c.email} ${c.company} ${c.phone}`.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.customers().subscribe({
      next: c => this.customers.set(c),
      error: () => this.error.set('Cannot reach the API. Is the Spring Boot backend running on port 8080?')
    });
  }

  edit(c: Customer | null): void {
    this.form.set(c ? { ...c } : blank());
  }

  save(): void {
    const f = this.form();
    if (!f?.name.trim()) {
      return;
    }
    this.api.saveCustomer(f).subscribe({
      next: () => {
        this.form.set(null);
        this.error.set('');
        this.load();
      },
      error: () => this.error.set('Could not save the customer.')
    });
  }

  remove(c: Customer): void {
    if (!confirm(`Delete ${c.name}?`)) {
      return;
    }
    this.api.deleteCustomer(c.id!).subscribe({
      next: () => {
        this.error.set('');
        this.load();
      },
      error: e =>
        this.error.set(e.status === 409 ? `${c.name} still has deals. Delete those first.` : 'Could not delete the customer.')
    });
  }

  initials(name: string): string {
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }
}
