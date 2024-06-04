import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  public key: string = '';
  public step: number = 1;
  public isLoading: boolean = false;

  constructor() { }
}
