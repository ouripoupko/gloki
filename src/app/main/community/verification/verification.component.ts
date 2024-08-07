import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgentService } from 'src/app/agent.service';
import { Method } from 'src/app/contract';
import { AuthenticateComponent } from 'src/app/dialogs/authenticate/authenticate.component';
import { Community, CommunityService } from 'src/app/services/community.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.scss'
})
export class VerificationComponent implements OnInit {
  @Input() communityId?: string;
  community?: Community;

  constructor(
    public communityService: CommunityService,
    public profileService: ProfileService,
    private agentService: AgentService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    if(this.communityId) {
      this.community = this.communityService.communities[this.communityId];
      console.log('tasks', this.community.tasks)
    }
  }

  countVerified() {
    return this.community ? Object.values(this.community.tasks).filter(x => x).length : 0;
  }

  authenticate(agent: string) {
    const dialogRef = this.dialog.open(AuthenticateComponent, {
      panelClass: 'info-box',
      backdropClass: 'dialog-backdrop',
      data: {
        instructions: this.community?.properties['instructions'],
        profile: this.profileService.others[agent]
      }
    });
    dialogRef.afterClosed().subscribe(didApprove => {
      if (didApprove !== undefined && this.community?.contract) {
        let method = {} as Method;
        method.name = didApprove ? 'approve' : 'disapprove';
        method.values = didApprove ? {'approved': agent} : {'disapproved': agent};
        this.agentService.write(this.community.contract.id, method).subscribe();
      }
    });
  }
}
