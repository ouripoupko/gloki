import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  isEdit = true;
  firstName = '';
  lastName = '';
  selectedPhoto: string | null = null;
  userPhoto = ''; // Set the default user photo URL here

  get isFormValid(): boolean {
    return this.firstName.trim() !== '' && this.lastName.trim() !== '' && this.selectedPhoto !== null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedPhoto = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  saveProfile() {
    if (this.isFormValid) {
      // Save the profile data and update the userPhoto
      this.userPhoto = this.selectedPhoto || '';
      this.isEdit = false;
    }
  }

  editProfile() {
    this.isEdit = true;
  }
}
