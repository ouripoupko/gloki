import { Injectable } from '@angular/core';
import { Contract, Method } from './contract';
import { Observable, of, first } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient
  ) { }


  listen(server: string, identity: string): EventSource {
    console.log('connecting to SSE');
    return new EventSource(`${server}/stream?agent=${identity}&contract=`);
  }

  isExistAgent(server: string, identity: string): Observable<Boolean> {
    let params = new HttpParams().set('action', 'is_exist_agent');
    return this.http.get<Boolean>(`${server}/ibc/app/${identity}`, {params: params}).pipe(
        tap(_ => console.log('query agent')),
        catchError(this.handleError<Boolean>('isExistAgent')),
        first()
      );
  }

  registerAgent(server: string, identity: string): Observable<Boolean> {
    let params = new HttpParams().set('action', 'register_agent');
    return this.http.put<Boolean>(`${server}/ibc/app/${identity}`, {address: server}, {...this.httpOptions, params:params} ).pipe(
      tap(_ => console.log('added new identity')),
      catchError(this.handleError<Boolean>('registerAgent')),
      first()
    );
  }

  getContracts(server: string, identity: string): Observable<Contract[]> {
    let params = new HttpParams().set('action', 'get_contracts');
    return this.http.get<Contract[]>(`${server}/ibc/app/${identity}`, {params: params}).pipe(
        tap(_ => console.log('fetched contracts')),
        catchError(this.handleError<Contract[]>('getContracts', [])),
        first()
      );
  }

  addContract(server: string, agent: string, contract: Contract): Observable<string> {
    console.log('add new contract:', contract);
    let params = new HttpParams().set('action', 'deploy_contract');
    return this.http.put<string>(`${server}/ibc/app/${agent}`,
                                    contract,
                                    {...this.httpOptions, params: params}).pipe(
      tap(_ => console.log('added contract')),
      catchError(this.handleError<string>('addContract')),
      first()
    );
  }

  joinContract(server: string, agent: string,
               address: string, other_agent: string, contract_id: string, profile: string): Observable<any> {
    let params = new HttpParams().set('action', 'join_contract');
    return this.http.put(`${server}/ibc/app/${agent}`,
                         { address: address, agent: other_agent, contract: contract_id, profile: profile },
                          {...this.httpOptions, params: params}).pipe(
      tap(_ => console.log('joined contract')),
      catchError(this.handleError<any>('connect')),
      first()
    );
  }

  write(server: string, identity: string, contract: string, method: Method): Observable<any> {
    const url = `${server}/ibc/app/${identity}/${contract}/${method.name}`;
    let params = new HttpParams().set('action', 'contract_write');
    return this.http.post<any>(url, method, {...this.httpOptions, params: params}).pipe(
      tap(_ => console.log('wrote something')),
      catchError(this.handleError<any>(`write name=${name}`))
    );
  }

  read(server: string, identity: string, contract: string, method: Method): Observable<any> {
    const url = `${server}/ibc/app/${identity}/${contract}/${method.name}`;
    let params = new HttpParams().set('action', 'contract_read');
    return this.http.post<any>(url, method, {...this.httpOptions, params: params}).pipe(
      tap(_ => console.log('read something')),
      catchError(this.handleError<any>(`read name=${name}`))
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
