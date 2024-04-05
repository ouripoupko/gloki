import { Component } from '@angular/core';

@Component({
  selector: 'app-main-bar',
  templateUrl: './main-bar.component.html',
  styleUrl: './main-bar.component.scss'
})
export class MainBarComponent {
  isProfileFull = false;
  userPhoto = '';
}