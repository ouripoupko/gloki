import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InfoComponent } from 'src/app/dialogs/info/info.component';
import { Router, RouterModule } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService } from 'src/app/agent.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  isEdit = true;
  userPhoto: string = '';

  constructor (
    private agentService: AgentService,
    public profileService: ProfileService,
    public dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.profileService.isProfileFull()) {
      this.isEdit = false;
      this.userPhoto = this.profileService.profile?.image_url;
    }
  }

  get isFormValid(): boolean {
    return !!(this.profileService.profile?.first_name && this.profileService.profile?.last_name && this.userPhoto);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    this.resizeImage(file, 200, 200).then(dataUrl => {
      this.userPhoto = dataUrl;
    }, err => {
      console.error("Photo error", err);
    });
  }

  saveProfile() {
    if (this.isFormValid) {
      this.profileService.profile.image_url = this.userPhoto;
      this.isEdit = false;
      this.profileService.writeProfile().subscribe(_ => {
        this.router.navigate(['main', 'communities'], {replaceUrl: true});
      });
    }
  }

  editProfile() {
    this.isEdit = true;
  }

  resizeImage(file:File, maxWidth:number, maxHeight:number):Promise<string> {
    return new Promise((resolve, reject) => {
      let image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        let width = image.width;
        let height = image.height;
        
        if (width <= maxWidth && height <= maxHeight) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            } else {
              reject(new Error('Error reading file'));
            }
          };
          reader.readAsDataURL(file);
        }

        let newWidth;
        let newHeight;

        if (width > height) {
            newHeight = height * (maxWidth / width);
            newWidth = maxWidth;
        } else {
            newWidth = width * (maxHeight / height);
            newHeight = maxHeight;
        }

        let canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        let context = canvas.getContext('2d');

        if (context) {
          context.drawImage(image, 0, 0, newWidth, newHeight);
        }

        resolve(canvas.toDataURL('image/jpeg'));

      };
      image.onerror = reject;
    });
  }

  viewInfo(header: string, content: string) {
    this.dialog.open(InfoComponent, {
      panelClass: 'info-box',
      backdropClass: 'dialog-backdrop',
      data: {
        header: header,
        summary: '',
        content: content
      }
    });
  }

  viewGlokiInfo() {
    this.viewInfo('Your gloki:', this.agentService.agent)
  }

  viewIbcInfo() {
    this.viewInfo('Your IBC address:', this.agentService.server)
  }

  logout() {
    this.router.navigate(['login'], {replaceUrl: true});
  }
}
