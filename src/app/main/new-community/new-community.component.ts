import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { InfoComponent } from 'src/app/dialogs/info/info.component';
import { GlokiService } from 'src/app/gloki.service';

@Component({
  selector: 'app-new-community',
  templateUrl: './new-community.component.html',
  styleUrl: './new-community.component.scss'
})
export class NewCommunityComponent {

  name: string = '';
  description: string = '';

  constructor (
    private gloki: GlokiService,
    private location: Location,
    private router: Router,
    public dialog: MatDialog,
  ) {}

  onSave(event: any) {
    this.gloki.deployCommunity(this.name, this.description).subscribe(_ => {
      console.log('going to navigate')
      this.router.navigate(['main', 'communities'], {replaceUrl: true});
    });
  }

  showInfo() {
    this.dialog.open(InfoComponent, {
      panelClass: 'info-box',
//      backdropClass: 'dialog-backdrop',
      data: {
        header: 'Tell newcomers how to join',
        summary: 'Explain how to become a verified community member',
        content: 'For example: "To verify the person in front of you, make sure the profile picture faithfully represents him or her"'
      }
    });
  }
}
