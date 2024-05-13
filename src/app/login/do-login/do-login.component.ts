import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GlokiService } from 'src/app/services/gloki.service';

@Component({
  selector: 'app-do-login',
  templateUrl: './do-login.component.html',
  styleUrl: './do-login.component.scss'
})
export class DoLoginComponent {

  constructor (
    private router: Router,
    private gloki: GlokiService
  ) { }

}
