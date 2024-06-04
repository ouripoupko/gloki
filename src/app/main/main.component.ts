import { Component } from '@angular/core';
import { GlokiService } from '../services/gloki.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

  constructor (
    public gloki: GlokiService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.gloki.agentExists) {
      this.router.navigate(['login'], {replaceUrl: true});
      return;
    }
  }
}
