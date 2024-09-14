import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [
    MatDialogModule
  ],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {

  constructor (
    @Inject(MAT_DIALOG_DATA) public data: {header: string, summary: string, content: string}
  ) { }
}
