import { Injectable } from '@angular/core';
import { Contract, Method, Partner } from './contract';
import { Observable, of, first } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  server: string = '';
  agent: string = '';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient
  ) { }

  setServer(server: string, agent: string) {
    this.agent = agent;
    this.server = server;
  }

  listen(contracts: string[]): EventSource {
    console.log('connecting to SSE');
    let query = contracts.map(contract => `agent=${this.agent}&contract=${contract ?? ''}`).join('&');
    return new EventSource(`${this.server}/stream?${query}`);
  }

  isExistAgent(): Observable<Boolean> {
    let params = new HttpParams().set('action', 'is_exist_agent');
    return this.http.get<Boolean>(`${this.server}/ibc/app/${this.agent}`, {params: params}).pipe(
        tap(_ => console.log('query agent')),
        catchError(this.handleError<Boolean>('isExistAgent')),
        first()
      );
  }

  registerAgent(): Observable<Boolean> {
    let params = new HttpParams().set('action', 'register_agent');
    return this.http.put<Boolean>(`${this.server}/ibc/app/${this.agent}`, {address: this.server}, {...this.httpOptions, params:params} ).pipe(
      tap(_ => console.log('added new identity')),
      catchError(this.handleError<Boolean>('registerAgent')),
      first()
    );
  }

  getContracts(): Observable<Contract[]> {
    let params = new HttpParams().set('action', 'get_contracts');
    return this.http.get<Contract[]>(`${this.server}/ibc/app/${this.agent}`, {params: params}).pipe(
        tap(_ => console.log('fetched contracts')),
        catchError(this.handleError<Contract[]>('getContracts', [])),
        first()
      );
  }

  addContract(contract: Contract): Observable<string> {
    let params = new HttpParams().set('action', 'deploy_contract');
    return this.http.put<string>(`${this.server}/ibc/app/${this.agent}`,
                                    contract,
                                    {...this.httpOptions, params: params}).pipe(
      tap(_ => console.log('added contract')),
      catchError(this.handleError<string>('addContract')),
      first()
    );
  }

  joinContract(address: string, other_agent: string, contract_id: string, profile: string): Observable<any> {
    let params = new HttpParams().set('action', 'join_contract');
    return this.http.put(`${this.server}/ibc/app/${this.agent}`,
                         { address: address, agent: other_agent, contract: contract_id, profile: profile },
                          {...this.httpOptions, params: params}).pipe(
      tap(_ => console.log('joined contract')),
      catchError(this.handleError<any>('connect')),
      first()
    );
  }

  write(contract: string, method: Method): Observable<any> {
    const url = `${this.server}/ibc/app/${this.agent}/${contract}/${method.name}`;
    let params = new HttpParams().set('action', 'contract_write');
    return this.http.post<any>(url, method, {...this.httpOptions, params: params}).pipe(
      tap(_ => console.log('wrote something')),
      catchError(this.handleError<any>(`write name=${method.name}`))
    );
  }

  read(contract: string, method: Method): Observable<any> {
    const url = `${this.server}/ibc/app/${this.agent}/${contract}/${method.name}`;
    let params = new HttpParams().set('action', 'contract_read');
    return this.http.post<any>(url, method, {...this.httpOptions, params: params}).pipe(
      tap(_ => console.log('read something')),
      catchError(this.handleError<any>(`read name=${method.name}`))
    );
  }

  readRemote(server: string, agent: string, contract: string, method: Method): Observable<any> {
    const url = `${server}/ibc/app/${agent}/${contract}/${method.name}`;
    let params = new HttpParams().set('action', 'contract_read');
    return this.http.post<any>(url, method, {...this.httpOptions, params: params}).pipe(
      tap(_ => console.log('read something')),
      catchError(this.handleError<any>(`read name=${method.name}`))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      //  send the error to remote logging infrastructure
      console.log(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
