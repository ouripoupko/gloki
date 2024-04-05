import { Component, OnInit } from '@angular/core';
import { GlokiService } from '../../gloki.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  isEdit = true;
  userPhoto = ''; // Set the default user photo URL here

  constructor (
    public gloki: GlokiService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    if (!this.gloki.profileContract) {
      this.router.navigate(['login'])
    }
  }

  get isFormValid(): boolean {
    return this.gloki.isProfileFull();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.gloki.profile.image_url = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  saveProfile() {
    console.log('save clicked');
    if (this.isFormValid) {
      // Save the profile data and update the userPhoto
      this.userPhoto = this.gloki.profile.image_url || '';
      this.isEdit = false;
      this.gloki.writeProfile().subscribe(_ => {
        if (this.gloki.isProfileFull()) {
          this.location.back();
        }
      });
    }
  }

  editProfile() {
    this.isEdit = true;
  }
}
