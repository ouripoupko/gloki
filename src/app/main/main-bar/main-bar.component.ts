import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ScanComponent } from 'src/app/dialogs/scan/scan.component';
import { GlokiService, Invite } from 'src/app/gloki.service';

@Component({
  selector: 'app-main-bar',
  templateUrl: './main-bar.component.html',
  styleUrl: './main-bar.component.scss'
})
export class MainBarComponent {

  constructor (
    public gloki: GlokiService,
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
        this.gloki.joinCommunity(result).subscribe(() => {
          this.router.navigate(['main', 'communities'], {replaceUrl: true})
        });
      }
    });
  }
}
