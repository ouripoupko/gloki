import { Component, OnInit } from '@angular/core';
import { GlokiService } from '../services/gloki.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit{

  constructor (
    public gloki: GlokiService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('main ngOnInit', this.gloki.agentExists);
    if (!this.gloki.agentExists) {
      this.router.navigate(['login'], {replaceUrl: true});
      return;
    }
  }
}
