import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { InfoComponent } from 'src/app/dialogs/info/info.component';
import { CommunityService } from 'src/app/services/community.service';

@Component({
  selector: 'app-new-community',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule
  ],
  templateUrl: './new-community.component.html',
  styleUrl: './new-community.component.scss'
})
export class NewCommunityComponent {

  name: string = '';
  description: string = '';

  constructor (
    private communityService: CommunityService,
    private router: Router,
    public dialog: MatDialog,
  ) {}

  onSave(event: any) {
    this.communityService.deployCommunity(this.name, this.description).subscribe(_ => {
      this.router.navigate(['main', 'communities'], {replaceUrl: true});
    });
  }

  showInfo() {
    this.dialog.open(InfoComponent, {
      panelClass: 'info-box',
      // backdropClass: 'dialog-backdrop',
      data: {
        header: 'Tell newcomers how to join',
        summary: 'Explain how to become a verified community member',
        content: 'For example: "To verify the person in front of you, make sure the profile picture faithfully represents him or her"'
      }
    });
  }
}
