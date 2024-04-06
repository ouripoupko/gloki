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
    if (this.gloki.isProfileFull()) {
      this.isEdit = false;
      this.userPhoto = this.gloki.profile.image_url;
    }
  }

  get isFormValid(): boolean {
    return !!(this.gloki.profile.first_name && this.gloki.profile.last_name && this.userPhoto);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    this.resizeImage(file, 200, 200).then(dataUrl => {
      this.userPhoto = dataUrl;
      console.log('imageURL', this.userPhoto);
    }, err => {
      console.error("Photo error", err);
    });

    /*const reader = new FileReader();
    reader.onload = (e: any) => {
      //this.gloki.profile.image_url = e.target.result;
      this.userPhoto = e.target.result;
    };
    reader.readAsDataURL(file);*/
  }

  saveProfile() {
    console.log('save clicked');
    if (this.isFormValid) {
      // Save the profile data and update the userPhoto
      //this.userPhoto = this.gloki.profile.image_url || '';
      this.gloki.profile.image_url = this.userPhoto;
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
}
