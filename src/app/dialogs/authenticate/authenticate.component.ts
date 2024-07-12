import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Profile } from 'src/app/services/profile.service';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrl: './authenticate.component.scss'
})
export class AuthenticateComponent {

  constructor (
    @Inject(MAT_DIALOG_DATA) public data: {instructions: string, profile: Profile}
  ) { }
}
