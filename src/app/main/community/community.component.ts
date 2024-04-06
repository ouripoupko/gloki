import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlokiService } from 'src/app/gloki.service';

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrl: './community.component.scss'
})
export class CommunityComponent implements OnInit {
  communityId: string = '';
  shareMode: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public gloki: GlokiService
  ) { }

  ngOnInit(): void {
    if (!this.gloki.profileContract) {
      this.router.navigate(['login']);
    }
    this.route.paramMap.subscribe(params => {
      this.communityId = params.get('communityId') || '';
    });
  }

  toggleShareMode(mode: boolean): void {
    this.shareMode = mode;
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }

  openApp(app: string) {
    const baseURL = window.location.origin;
    const url = new URL("/" + app, baseURL);
    url.searchParams.append("server", this.gloki.server);
    url.searchParams.append("agent", this.gloki.agent);
    url.searchParams.append("contract", this.communityId);
    console.log('url', url);

    window.open(url, "_blank");
  }

}
