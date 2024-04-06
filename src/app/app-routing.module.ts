import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { ScanComponent } from './main/scan/scan.component';
import { CommunityComponent } from './main/community/community.component';
import { ProfileComponent } from './main/profile/profile.component';
import { ShareComponent } from './main/share/share.component';
import { NewCommunityComponent } from './main/new-community/new-community.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { path: 'login', component: LoginComponent },
      { path: 'main', component: MainComponent },
      { path: 'main/:communityId', component: CommunityComponent },
      { path: 'scan', component: ScanComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'share', component: ShareComponent },
      { path: 'create', component: NewCommunityComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }