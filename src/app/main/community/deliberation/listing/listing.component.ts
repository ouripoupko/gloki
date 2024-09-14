import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Deliberation, DeliberationService } from 'src/app/services/deliberation.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule
  ],
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.scss'
})
export class ListingComponent implements OnInit, OnChanges {

  @Input() public contractId?: string;
  deliberation: Deliberation = {} as Deliberation;
  @Output() addEvent = new EventEmitter<null>();
  selected = '';

  constructor(
    public deliberationService: DeliberationService
  ) {
  }

  ngOnInit(): void {
    if(this.contractId) {
      this.deliberation = this.deliberationService.deliberations[this.contractId];
    }
  }

  ngOnChanges(): void {
    this.selected = '';
  }

  goIn(sid: string) {
    if (this.contractId) {
      this.deliberation.sid = sid;
      this.deliberationService.readDeliberation(this.contractId, sid).subscribe();
    }
  }
}
