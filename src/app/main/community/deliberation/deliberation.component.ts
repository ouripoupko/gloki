import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop} from '@angular/cdk/drag-drop';

import { NewStatementComponent } from 'src/app/dialogs/new-statement/new-statement.component';
import { Deliberation, DeliberationService } from 'src/app/services/deliberation.service';
import { AgentService } from 'src/app/agent.service';
import { CommunityService } from 'src/app/services/community.service';
import { ListenService } from 'src/app/services/listen.service';
import { filter, take, takeWhile } from 'rxjs';

@Component({
  selector: 'app-deliberation',
  templateUrl: './deliberation.component.html',
  styleUrl: './deliberation.component.scss'
})
export class DeliberationComponent implements OnInit {

  @Input() public contractId?: string;
  @Input() public communityId?: string;
  deliberation: Deliberation = {} as Deliberation;
  isVoting: boolean = false;
  unsorted: string[] = [];
  support: string[] = [];
  oppose: string[] = [];
  list_of_lists: {[key: string]: string[]} = {};
  selected = '';
  isChatting = false;
  isJoining = false;

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
        this.isChatting = true;
        this.deliberation = this.deliberationService.deliberations[this.contractId];
        this.deliberation.notifier?.asObservable().subscribe(_=> {
          this.readPage();
        });
      }
    }
  }

  readPage() {
    let rankings = this.deliberation.page.parent?.ranking_kids || this.deliberation.page.ranking_topics;
    if(rankings) {
      this.support = [...(rankings[this.agentService.agent]?.[0] || [])];
      this.oppose = [...(rankings[this.agentService.agent]?.[1] || [])];
      this.unsorted = Object.keys(this.deliberation.page.kids);
      this.support = this.support.filter( x => this.unsorted.includes(x) );
      this.oppose = this.oppose.filter( x => this.unsorted.includes(x) );
      this.unsorted = this.unsorted.filter( x => !this.support.includes(x) && !this.oppose.includes(x) )
      this.list_of_lists = {
        'unsorted': this.unsorted,
        'support': this.support,
        'oppose': this.oppose
      }
    }
  }

  create() {
    const dialogRef = this.dialog.open(NewStatementComponent, {
      panelClass: 'info-box',
      backdropClass: 'dialog-backdrop'
    });
    dialogRef.afterClosed().subscribe(text => {
      if(this.contractId && text && text.trim() !== '') {
        this.deliberationService.createStatement(this.contractId, this.deliberation.sid || null, text)
      }
    });

  }

  drop(event: CdkDragDrop<string[]>) {
    let key = this.list_of_lists[event.previousContainer.id][event.previousIndex];
    this.list_of_lists[event.previousContainer.id].splice(event.previousIndex, 1);
    this.list_of_lists[event.container.id].splice(event.currentIndex, 0, key);
  }

  vote() {
    if (this.contractId) {
      this.deliberationService.setRanking(this.contractId, this.deliberation.sid || null, [this.support, this.oppose]);
      this.isVoting = false;
    }
  }

  goIn(sid: string) {
    if (this.contractId) {
      this.deliberation.sid = sid;
      this.selected = '';
      this.deliberationService.readDeliberation(this.contractId, sid).subscribe();
    }
  }

  goOut() {
    if (this.contractId) {
      this.deliberation.sid = this.deliberation.page.parent?.parent || null;
      this.selected = '';
      this.deliberationService.readDeliberation(this.contractId, this.deliberation.sid).subscribe();
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
}
