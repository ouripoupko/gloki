import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

import { NewStatementComponent } from 'src/app/dialogs/new-statement/new-statement.component';
import { Deliberation, DeliberationService } from 'src/app/services/deliberation.service';
import { AgentService } from 'src/app/agent.service';

@Component({
  selector: 'app-deliberation',
  templateUrl: './deliberation.component.html',
  styleUrl: './deliberation.component.scss'
})
export class DeliberationComponent {

  @Input() public contractId?: string;
  deliberation: Deliberation = {} as Deliberation;
  isVoting: boolean = false;
  unsorted: string[] = [];
  support: string[] = [];
  oppose: string[] = [];
  list_of_lists: {[key: string]: string[]} = {};
  selected = '';

  constructor(
    public deliberationService: DeliberationService,
    public agentService: AgentService,
    public dialog: MatDialog
  ) {
   }

  ngOnInit(): void {
    if(this.contractId) {
      this.deliberation = this.deliberationService.deliberations[this.contractId];
      this.deliberation.notifier?.asObservable().subscribe(_=> {
        this.init();
        console.log('got notification');
    });
    }
  }

  init() {
    let rankings = this.deliberation.page.parent?.ranking_kids || this.deliberation.page.ranking_topics;
    if(rankings) {
      console.log('set ranks');
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
}
