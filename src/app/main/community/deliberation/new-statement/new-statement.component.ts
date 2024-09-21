import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Deliberation, DeliberationService } from 'src/app/services/deliberation.service';

@Component({
  selector: 'app-new-statement',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './new-statement.component.html',
  styleUrl: './new-statement.component.scss'
})
export class NewStatementComponent implements OnInit, AfterViewInit {

  @Input() public contractId?: string;
  deliberation: Deliberation = {} as Deliberation;
  @Output() closeEvent = new EventEmitter<null>();
  statement = '';
  @ViewChild('textareaElement') textarea!: ElementRef;

  constructor(
    public deliberationService: DeliberationService
  ) { }

  ngOnInit(): void {
    if(this.contractId) {
      this.deliberation = this.deliberationService.deliberations[this.contractId];
    }
  }

  ngAfterViewInit() {
    this.textarea.nativeElement.focus();
  }

  onAdd() {
    if(this.contractId && this.statement && this.statement.trim() !== '') {
      this.deliberationService.createStatement(this.contractId, this.deliberation.sid || null, this.statement);
      this.closeEvent.emit();
    }
  }
}
