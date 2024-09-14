import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Deliberation, DeliberationService } from 'src/app/services/deliberation.service';
import { AgentService } from 'src/app/agent.service';
import { CommunityService } from 'src/app/services/community.service';
import { filter, take } from 'rxjs';
import { SortingComponent } from './sorting/sorting.component';
import { NewStatementComponent } from './new-statement/new-statement.component';
import { ListingComponent } from './listing/listing.component';
import { CommonModule } from '@angular/common';

enum Subpage {
  NONE,
  LISTING,
  ADDING,
  SORTING
};

@Component({
  selector: 'app-deliberation',
  standalone: true,
  imports: [
    CommonModule,
    SortingComponent,
    NewStatementComponent,
    ListingComponent
  ],
  templateUrl: './deliberation.component.html',
  styleUrl: './deliberation.component.scss'
})
export class DeliberationComponent implements OnInit {

  @Input() public contractId?: string;
  @Input() public communityId?: string;
  deliberation: Deliberation = {} as Deliberation;
  isJoining: boolean = false;
  readonly Subpage = Subpage;
  subpage: Subpage = Subpage.NONE;

  constructor(
    public deliberationService: DeliberationService,
    public communityService: CommunityService,
    public agentService: AgentService,
    public dialog: MatDialog
  ) {
   }

  ngOnInit(): void {
    this.init();
  }

  init() {
    if(this.contractId && this.communityId) {
      if(this.contractId in this.deliberationService.deliberations) {
        this.subpage = Subpage.LISTING;
        this.deliberation = this.deliberationService.deliberations[this.contractId];
      }
    }
  }

  joinDelib() {
    if(this.communityId && this.contractId) {
      let server = this.communityService.communities[this.communityId].contract.address;
      let agent = this.communityService.communities[this.communityId].contract.pid;
      this.deliberationService.notifier.pipe(
        filter(value => value === this.contractId),
        take(1)
      )
      .subscribe(value => {
        this.init();
      });
      this.isJoining = true;
      this.deliberationService.joinDelib(server, agent, this.contractId);
    }
  }

  goOut() {
    if (this.contractId) {
      this.deliberation.sid = this.deliberation.page.parent?.parent || null;
      this.deliberationService.readDeliberation(this.contractId, this.deliberation.sid).subscribe();
    }
  }
}
