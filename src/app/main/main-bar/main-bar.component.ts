import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Invite } from 'src/app/contract';
import { ScanComponent } from 'src/app/dialogs/scan/scan.component';
import { CommunityService } from 'src/app/services/community.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-main-bar',
  templateUrl: './main-bar.component.html',
  styleUrl: './main-bar.component.scss'
})
export class MainBarComponent {

  constructor (
    public profileService: ProfileService,
    private communityService: CommunityService,
    public dialog: MatDialog,
    private router: Router
  ) {}

  onFind() {
    const dialogRef = this.dialog.open(ScanComponent, {
      panelClass: 'scan-box',
      backdropClass: 'dialog-backdrop',
      data: {
        testResult: (result: string) => {
          return JSON.parse(result) as Invite;
        },
        resultHeader: 'Community Name:',
        resultStringify: (result: Invite) => result.name
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.communityService.joinCommunity(result).subscribe(() => {
          this.router.navigate(['main', 'communities'], {replaceUrl: true})
        });
      }
    });
  }
}
