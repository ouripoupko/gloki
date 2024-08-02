import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewStatementComponent } from 'src/app/dialogs/new-statement/new-statement.component';
import { Deliberation, DeliberationService } from 'src/app/services/deliberation.service';

@Component({
  selector: 'app-deliberation',
  templateUrl: './deliberation.component.html',
  styleUrl: './deliberation.component.scss'
})
export class DeliberationComponent {

  @Input() public contractId?: string;
  deliberation?: Deliberation;
  isVoting: boolean = false;

  constructor(
    public deliberationService: DeliberationService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    if(this.contractId) {
      this.deliberation = this.deliberationService.deliberations[this.contractId];
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
}
