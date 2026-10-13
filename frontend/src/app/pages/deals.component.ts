import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../api.service';
import { Customer, DEAL_STAGES, Deal, DealRequest, DealStage } from '../models';

interface DealForm extends DealRequest {
  id?: number;
}

const blank = (): DealForm => ({ title: '', description: '', amount: 0, stage: 'NEW', customerId: 0 });

@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe],
  template: `
    <header class="page-head">
      <h1>Deals</h1>
      <div class="toolbar">
        <label class="search white">
          <img src="assets/icons/search.svg" alt="" width="24" height="24" />
          <input type="search" placeholder="Search" [ngModel]="query()" (ngModelChange)="query.set($event)" />
        </label>
        <select class="select" [ngModel]="stage()" (ngModelChange)="stage.set($event)">
          <option value="">All stages</option>
          @for (s of stages; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
        <button class="btn" (click)="edit(null)" [disabled]="!customers().length">+ Add deal</button>
      </div>
    </header>

    @if (error()) {
      <div class="error">{{ error() }}</div>
    }

    <section class="card">
      <div class="table-wrap">
        <table class="data">
          <thead>
            <tr><th>Deal</th><th>Customer</th><th>Stage</th><th>Amount</th><th>Created</th><th></th></tr>
          </thead>
          <tbody>
            @for (d of filtered(); track d.id) {
              <tr>
                <td>
                  <div class="primary">{{ d.title }}</div>
                  <div class="secondary">{{ d.description }}</div>
                </td>
                <td>{{ d.customerName }}</td>
                <td><span class="badge" [class]="'badge ' + d.stage">{{ d.stage }}</span></td>
                <td class="amount">{{ d.amount | currency: 'USD' : 'symbol' : '1.0-0' }}</td>
                <td>{{ d.createdAt | date: 'mediumDate' }}</td>
                <td>
                  <div class="actions">
                    <button class="btn ghost small" (click)="edit(d)">Edit</button>
                    <button class="btn danger small" (click)="remove(d)">Delete</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="empty">No deals found.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    @if (form(); as f) {
      <div class="backdrop" (click)="form.set(null)">
        <form class="modal" (click)="$event.stopPropagation()" (ngSubmit)="save()">
          <h2>{{ f.id ? 'Edit deal' : 'New deal' }}</h2>
          <label>Title <input name="title" [(ngModel)]="f.title" required /></label>
          <label>Description <input name="description" [(ngModel)]="f.description" /></label>
          <label>Customer
            <select name="customer" [(ngModel)]="f.customerId" required>
              @for (c of customers(); track c.id) {
                <option [ngValue]="c.id">{{ c.name }} ({{ c.company }})</option>
              }
            </select>
          </label>
          <div class="row">
            <label>Amount ($) <input name="amount" type="number" min="0" [(ngModel)]="f.amount" /></label>
            <label>Stage
              <select name="stage" [(ngModel)]="f.stage">
                @for (s of stages; track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </select>
            </label>
          </div>
          <div class="footer">
            <button type="button" class="btn ghost" (click)="form.set(null)">Cancel</button>
            <button type="submit" class="btn" [disabled]="!f.title.trim() || !f.customerId">Save</button>
          </div>
        </form>
      </div>
    }
  `
})
export class DealsComponent implements OnInit {
  private api = inject(ApiService);

  readonly stages = DEAL_STAGES;

  deals = signal<Deal[]>([]);
  customers = signal<Customer[]>([]);
  query = signal('');
  stage = signal<DealStage | ''>('');
  form = signal<DealForm | null>(null);
  error = signal('');

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const stage = this.stage();
    return this.deals()
      .filter(d => !stage || d.stage === stage)
      .filter(d => !q || `${d.title} ${d.customerName} ${d.description}`.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.load();
    this.api.customers().subscribe({ next: c => this.customers.set(c), error: () => undefined });
  }

  load(): void {
    this.api.deals().subscribe({
      next: d => this.deals.set(d),
      error: () => this.error.set('Cannot reach the API. Is the Spring Boot backend running on port 8080?')
    });
  }

  edit(d: Deal | null): void {
    this.form.set(
      d
        ? { id: d.id, title: d.title, description: d.description, amount: d.amount, stage: d.stage, customerId: d.customerId }
        : { ...blank(), customerId: this.customers()[0]?.id ?? 0 }
    );
  }

  save(): void {
    const f = this.form();
    if (!f?.title.trim() || !f.customerId) {
      return;
    }
    const { id, ...body } = f;
    this.api.saveDeal(id, { ...body, amount: Number(body.amount) || 0 }).subscribe({
      next: () => {
        this.form.set(null);
        this.error.set('');
        this.load();
      },
      error: () => this.error.set('Could not save the deal.')
    });
  }

  remove(d: Deal): void {
    if (!confirm(`Delete "${d.title}"?`)) {
      return;
    }
    this.api.deleteDeal(d.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Could not delete the deal.')
    });
  }
}
