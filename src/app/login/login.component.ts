import { Component } from '@angular/core';
import { StateService } from './state.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  hamburgerOpen: boolean = false;
  backward: number[] = [1, 1, 2, 2];

  constructor(
    public state: StateService
  ) { }


  location(full: boolean) {
    return full ? location.origin : location.hostname + (location.port ? ' (' + location.port + ')' : '');
  }

}
