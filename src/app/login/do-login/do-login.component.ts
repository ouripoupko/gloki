import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GlokiService } from 'src/app/services/gloki.service';
import { StateService } from '../state.service';

@Component({
  selector: 'app-do-login',
  standalone: true,
  imports: [],
  templateUrl: './do-login.component.html',
  styleUrl: './do-login.component.scss'
})
export class DoLoginComponent {

  constructor (
    private router: Router,
    private gloki: GlokiService,
    private state: StateService
  ) { }

  login() {
    this.state.isLoading = true;
    this.router.navigate(['main', 'communities'], {replaceUrl: true})
  }
}
