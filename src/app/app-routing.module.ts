import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { ListComponent } from './main/list/list.component';
import { CommunityComponent } from './main/community/community.component';
import { ProfileComponent } from './main/profile/profile.component';
import { NewCommunityComponent } from './main/new-community/new-community.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { path: 'login', component: LoginComponent },
      { path: 'main', component: MainComponent, children: [
        { path: 'communities', component: ListComponent },
        { path: 'community/:communityId', component: CommunityComponent },
        { path: 'profile', component: ProfileComponent },
        { path: 'create', component: NewCommunityComponent }
      ]}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }