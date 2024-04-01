import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { ScanComponent } from './scan/scan.component';
import { CommunitiesComponent } from './communities/communities.component';
import { CommunityComponent } from './community/community.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: '', children: [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: 'login', component: LoginComponent },
    { path: 'main', component: MainComponent },
    { path: 'scan', component: ScanComponent},
    { path: 'communities', component: CommunitiesComponent},
    { path: 'community', component: CommunityComponent},
    { path: 'profile', component: ProfileComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
