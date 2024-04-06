import { Component, EventEmitter, Output } from '@angular/core';
import { GlokiService } from 'src/app/gloki.service';

@Component({
  selector: 'app-main-bar',
  templateUrl: './main-bar.component.html',
  styleUrl: './main-bar.component.scss'
})
export class MainBarComponent {
  isProfileFull = false;
  userPhoto = '';
  @Output() toggleEvent = new EventEmitter<boolean>();
  find = false;

  constructor (
    public gloki: GlokiService
  ) {}

  toggleFind() {
    this.find = !this.find;
    this.toggleEvent.emit(this.find);
  }

}
