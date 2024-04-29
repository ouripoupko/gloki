import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {

  constructor (
    @Inject(MAT_DIALOG_DATA) public data: {header: string, summary: string, content: string}
  ) { }
}
