import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { Invite } from 'src/app/contract';
import { ScanComponent } from 'src/app/dialogs/scan/scan.component';
import { ShareComponent } from 'src/app/dialogs/share/share.component';
import { CommunityService } from 'src/app/services/community.service';
import { ProfileService } from 'src/app/services/profile.service';
import { Buffer } from 'buffer'

@Component({
  selector: 'app-main-bar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './main-bar.component.html',
  styleUrl: './main-bar.component.scss'
})
export class MainBarComponent implements OnInit {

  communityId?: string;

  constructor (
    public profileService: ProfileService,
    private communityService: CommunityService,
    public dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentRoute = this.activatedRoute.firstChild?.snapshot.routeConfig?.path;
      const paramValue = this.activatedRoute.firstChild?.snapshot.params['communityId'];
      this.communityId = currentRoute === 'community/:communityId' ? paramValue : undefined;
    });
  }

  onShare() {
    this.dialog.open(ShareComponent, {
      panelClass: 'share-box',
      backdropClass: 'dialog-backdrop',
      data: {
        contractId: this.communityId
      }
    });
  }
  
  onFind() {
    const dialogRef = this.dialog.open(ScanComponent, {
      panelClass: 'scan-box',
      backdropClass: 'dialog-backdrop',
      data: {
        parseResult: (result: Int8Array) => {
          const indexes = result.slice(0, 4).reduce((acc, curr) => [...acc, acc[acc.length - 1] + curr], [4]);
          return {
            server: Buffer.from(result.slice(indexes[0], indexes[1])).toString('ascii'),
            agent: Buffer.from(result.slice(indexes[1], indexes[2])).toString('hex'),
            contract: Buffer.from(result.slice(indexes[2], indexes[3])).toString('hex'),
            name: Buffer.from(result.slice(indexes[3], indexes[4])).toString('utf-8'),
          } as Invite
        },
        resultHeader: 'Community Name:',
        resultStringify: (result: Invite) => result.name
      }
    });
    dialogRef.afterClosed().subscribe((result: Invite) => {
      if (result) {
        this.communityService.joinCommunity(result).subscribe(() => {
          this.router.navigate(['main', 'communities'], {replaceUrl: true})
        });
      }
    });
  }
}
