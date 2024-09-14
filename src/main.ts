import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MainComponent } from './app/main/main.component';
import { LoginComponent } from './app/login/login.component';
import { ListComponent } from './app/main/list/list.component';
import { CommunityComponent } from './app/main/community/community.component';
import { ProfileComponent } from './app/main/profile/profile.component';
import { NewCommunityComponent } from './app/main/new-community/new-community.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    BrowserAnimationsModule
  ]
}).catch(err => console.error(err));
