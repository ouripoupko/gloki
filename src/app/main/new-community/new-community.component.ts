import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlokiService } from 'src/app/gloki.service';

@Component({
  selector: 'app-new-community',
  templateUrl: './new-community.component.html',
  styleUrl: './new-community.component.scss'
})
export class NewCommunityComponent implements OnInit {

  name: string = '';
  description: string = '';

  constructor (
    private gloki: GlokiService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.gloki.profileContract) {
      this.router.navigate(['login']);
    }
  }

  onSave(event: any) {
    this.gloki.deployCommunity(this.name, this.description).subscribe(_ => {
      this.location.back();
    });
  }

  onCancel(event: any) {
    this.location.back();
  }
}
