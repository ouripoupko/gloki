import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentService } from 'src/app/agent.service';
import { Community, CommunityService } from 'src/app/services/community.service';
import { DeliberationService } from 'src/app/services/deliberation.service';
import { GlokiService } from 'src/app/services/gloki.service';

enum Subpage {
  NONE,
  UNVERIFIED,
  MEMBERS,
  DELIBERATION,
  VERIFICATION,
  SHARE
}

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrl: './community.component.scss'
})
export class CommunityComponent implements OnInit {
  communityId?: string;
  community?: Community;
  subpage: Subpage = Subpage.NONE;
  readonly Subpage = Subpage;
  isMember = false;
  isChatting = false;
  isJoining = false;

  constructor(
    private route: ActivatedRoute,
    private agentService: AgentService,
    public gloki: GlokiService,
    public communityService: CommunityService,
    private deliberationService: DeliberationService
  ) { }

  ngOnInit(): void {
    console.log('community init');
    this.route.paramMap.subscribe(params => {
      this.communityId = params.get('communityId') || '';
      this.community = this.communityService.communities[this.communityId];
      this.community?.notifier?.asObservable().subscribe(_=>this.showCommunity());
    });
  }

  showCommunity() {
    console.log('community:', this.community)
    this.isMember = this.agentService.agent in (this.community?.members || {});
    const isCandidate = this.community?.nominates?.includes(this.agentService.agent);
    if (this.isMember) {
      this.subpage = Subpage.DELIBERATION;
    } else if (isCandidate) {
      this.subpage = Subpage.VERIFICATION;
    } else {
      this.subpage = Subpage.UNVERIFIED;
    }
    let contractId = this.community?.properties?.deliberation;
    this.isChatting = this.isMember && contractId in this.deliberationService.deliberations;
    console.log('community show', this.subpage);
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }

  joinDelib() {
    if(this.communityId && this.community) {
      let server = this.communityService.communities[this.communityId].contract.address;
      let agent = this.communityService.communities[this.communityId].contract.pid;
      this.isJoining = true;
      this.deliberationService.joinDelib(server, agent, this.community.properties.deliberation);
    }
  }
}
