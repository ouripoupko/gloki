import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { 
        path: 'login', 
        loadComponent: () => import('./app/login/login.component').then(m => m.LoginComponent)
      },
      { 
        path: 'main', 
        loadComponent: () => import('./app/main/main.component').then(m => m.MainComponent),
        children: [
          { 
            path: 'communities', 
            loadComponent: () => import('./app/main/list/list.component').then(m => m.ListComponent)
          },
          { 
            path: 'community/:communityId', 
            loadComponent: () => import('./app/main/community/community.component').then(m => m.CommunityComponent)
          },
          { 
            path: 'profile', 
            loadComponent: () => import('./app/main/profile/profile.component').then(m => m.ProfileComponent)
          },
          { 
            path: 'create', 
            loadComponent: () => import('./app/main/new-community/new-community.component').then(m => m.NewCommunityComponent)
          }
        ]
      }
    ]
  }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations()
  ]
}).catch(err => console.error(err));
