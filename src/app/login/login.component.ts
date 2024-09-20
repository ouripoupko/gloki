import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StateService } from './state.service';
import { ConnectComponent } from './connect/connect.component';
import { DoLoginComponent } from './do-login/do-login.component';
import { GlokiComponent } from './gloki/gloki.component';
import { StorageComponent } from './storage/storage.component';
import { HamburgerComponent } from '../dialogs/hamburger/hamburger.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ConnectComponent,
    DoLoginComponent,
    GlokiComponent,
    StorageComponent,
    HamburgerComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  hamburgerOpen: boolean = false;
  backward: number[] = [1, 1, 2, 2];

  constructor(
    public state: StateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.state.step = 1;
  }

  ngAfterViewInit() {
    // After view is initialized, manually trigger change detection
    this.cdr.detectChanges();
  }
}
