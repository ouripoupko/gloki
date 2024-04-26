import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  @Output() closeEvent = new EventEmitter<null>();
}
