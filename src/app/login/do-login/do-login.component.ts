import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-do-login',
  templateUrl: './do-login.component.html',
  styleUrl: './do-login.component.scss'
})
export class DoLoginComponent {

  constructor (
    private router: Router
  ) { }

  navigate() {
    this.router.navigate(['main']);
  }

}
