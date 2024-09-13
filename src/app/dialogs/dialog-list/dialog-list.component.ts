import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-list',
  templateUrl: './dialog-list.component.html',
  styleUrl: './dialog-list.component.scss'
})
export class DialogListComponent {

  constructor (
    @Inject(MAT_DIALOG_DATA) public data: string[]
  ) { }

}
