import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlokiService } from 'src/app/services/gloki.service';

enum Subpage {
  NONE,
  UNVERIFIED,
  MEMBERS,
  DELIBERATION,
  VERIFICATION
}

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrl: './community.component.scss'
})
export class CommunityComponent implements OnInit {
  communityId: string = '';
  shareMode: boolean = false;
  deliberationId: string = '';
  tasks: any;
  members: any;
  nominates: any;
  properties: any;
  subpage: Subpage = Subpage.NONE;
  readonly Subpage = Subpage;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public gloki: GlokiService
  ) { }

  ngOnInit(): void {
    // this.route.paramMap.subscribe(params => {
    //   this.communityId = params.get('communityId') || '';
    //   this.deliberationId = this.gloki.communityDeliberation[this.communityId];
    //   this.gloki.read(this.communityId, 'get_all').subscribe(reply => {
    //     this.tasks = reply.tasks;
    //     this.members = reply.members;
    //     this.nominates = reply.nominates;
    //     this.properties = reply.properties;
    //     if (this.gloki.agent in this.members) this.subpage = Subpage.MEMBERS;
    //     else this.subpage = Subpage.UNVERIFIED;
    //   });
    // });
  }

  toggleShareMode(mode: boolean): void {
    this.shareMode = mode;
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }

  openApp(app: string, contract: string) {
    // const baseURL = window.location.origin;
    // const url = new URL("/" + app, baseURL);
    // url.searchParams.append("server", this.gloki.server);
    // url.searchParams.append("agent", this.gloki.agent);
    // url.searchParams.append("contract", contract);
    // console.log('url', url);

    // window.open(url, "_blank");
  }

  joinDelib() {
    // this.gloki.joinDelib(this.communityId);
  }

  joinAuthentication(event: void) {
    this.gloki.write(this.communityId, 'request_join').subscribe();
  }
}
