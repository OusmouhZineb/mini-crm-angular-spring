import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Customer, DashboardStats, Deal, DealRequest } from './models';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  dashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${API}/dashboard`);
  }

  customers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${API}/customers`);
  }

  saveCustomer(c: Customer): Observable<Customer> {
    return c.id ? this.http.put<Customer>(`${API}/customers/${c.id}`, c) : this.http.post<Customer>(`${API}/customers`, c);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/customers/${id}`);
  }

  deals(): Observable<Deal[]> {
    return this.http.get<Deal[]>(`${API}/deals`);
  }

  saveDeal(id: number | undefined, d: DealRequest): Observable<Deal> {
    return id ? this.http.put<Deal>(`${API}/deals/${id}`, d) : this.http.post<Deal>(`${API}/deals`, d);
  }

  deleteDeal(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/deals/${id}`);
  }
}
