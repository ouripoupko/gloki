import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentService } from 'src/app/agent.service';
import { Community, CommunityService } from 'src/app/services/community.service';
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
  communityId?: string;
  community?: Community;
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
    private agentService: AgentService,
    public gloki: GlokiService,
    public communityService: CommunityService
  ) { }

  ngOnInit(): void {
    console.log('community init');
    this.route.paramMap.subscribe(params => {
      this.communityId = params.get('communityId') || '';
      this.community = this.communityService.communities[this.communityId];
      this.community.notifier.asObservable().subscribe(_=>this.showCommunity())
    });
  }

  showCommunity() {
    const isMember = this.agentService.agent in this.community?.members;
    const isCandidate = this.agentService.agent in this.community?.nominates;
    if (isMember) {
      this.subpage = Subpage.DELIBERATION;
    } else if (isCandidate) {
      this.subpage = Subpage.VERIFICATION;
    } else {
      this.subpage = Subpage.UNVERIFIED;
    }
    console.log('community show', this.subpage);
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
}
