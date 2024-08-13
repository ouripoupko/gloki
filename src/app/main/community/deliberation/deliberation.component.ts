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
  deliberation?: Deliberation;
  isVoting: boolean = false;
  unsorted: string[] = [];
  support: string[] = [];
  oppose: string[] = [];
  list_of_lists: {[key: string]: string[]} = {};
  isDragging = false;

  constructor(
    public deliberationService: DeliberationService,
    public agentService: AgentService,
    public dialog: MatDialog
  ) {
   }

  ngOnInit(): void {
    if(this.contractId) {
      this.deliberation = this.deliberationService.deliberations[this.contractId];
      this.support = [...(this.deliberation.parent?.ranking_kids[this.agentService.agent]?.[0] || [])];
      this.oppose = [...(this.deliberation.parent?.ranking_kids[this.agentService.agent]?.[1] || [])];
      this.unsorted = Object.keys(this.deliberation.kids);
      this.support = this.support.filter( x => this.unsorted.includes(x) );
      this.oppose = this.oppose.filter( x => this.unsorted.includes(x) );
      this.unsorted = this.unsorted.filter( x => !this.support.includes(x) && !this.oppose.includes(x) )
      this.list_of_lists = {'unsorted': this.unsorted,
                            'support': this.support,
                            'oppose': this.oppose}
      }
  }

  title() {
    return this.deliberation?.parent?.text || 'Topics:'
  }

  kids() {
    return this?.deliberation?.kids ? Object.values(this.deliberation.kids) : []
  }

  create() {
    const dialogRef = this.dialog.open(NewStatementComponent, {
      panelClass: 'info-box',
      backdropClass: 'dialog-backdrop'
    });
    dialogRef.afterClosed().subscribe(text => {
      if(this.contractId && text && text.trim() !== '') {
        this.deliberationService.createStatement(this.contractId, text)
      }
    });

  }

  drag(isDragging: boolean) {
    this.isDragging = isDragging;
    console.log('drag', this.isDragging);
  }

  drop(event: CdkDragDrop<string[]>) {
    this.isDragging = false;
    console.log('drop', this.isDragging)
    let key = this.list_of_lists[event.previousContainer.id][event.previousIndex];
    this.list_of_lists[event.previousContainer.id].splice(event.previousIndex, 1);
    this.list_of_lists[event.container.id].splice(event.currentIndex, 0, key);
  }
}
