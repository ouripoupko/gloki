import { Component } from '@angular/core';
import { GlokiService } from '../gloki.service';
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
    if (!this.gloki.profileContract) {
      this.router.navigate(['login'], {replaceUrl: true});
      return;
    }
    console.log('ngOnInit main going to listen', this.gloki.profileContract);
    this.gloki.listen();
  }
}
