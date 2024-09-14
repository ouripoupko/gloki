import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AgentService } from 'src/app/agent.service';
import { Deliberation, DeliberationService } from 'src/app/services/deliberation.service';

@Component({
  selector: 'app-sorting',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule
  ],
  templateUrl: './sorting.component.html',
  styleUrl: './sorting.component.scss'
})
export class SortingComponent implements OnInit {

  @Input() public contractId?: string;
  deliberation: Deliberation = {} as Deliberation;
  @Output() closeEvent = new EventEmitter<null>();
  unsorted: string[] = [];
  support: string[] = [];
  oppose: string[] = [];
  list_of_lists: {[key: string]: string[]} = {};

  constructor(
    public deliberationService: DeliberationService,
    public agentService: AgentService
  ) {
  }

  ngOnInit(): void {
    if(this.contractId) {
      this.deliberation = this.deliberationService.deliberations[this.contractId];
      let rankings = this.deliberation.page?.parent?.ranking_kids || this.deliberation.page?.ranking_topics;
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
  }

  drop(event: CdkDragDrop<string[]>) {
    let key = this.list_of_lists[event.previousContainer.id][event.previousIndex];
    this.list_of_lists[event.previousContainer.id].splice(event.previousIndex, 1);
    this.list_of_lists[event.container.id].splice(event.currentIndex, 0, key);
  }

  vote() {
    if (this.contractId) {
      this.deliberationService.setRanking(this.contractId, this.deliberation.sid || null, [this.support, this.oppose]);
      this.closeEvent.emit();
    }
  }

}
