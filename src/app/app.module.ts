import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { ScanComponent } from './dialogs/scan/scan.component';
import { ProfileComponent } from './main/profile/profile.component';
import { GlokiComponent } from './login/gloki/gloki.component';
import { StorageComponent } from './login/storage/storage.component';
import { ConnectComponent } from './login/connect/connect.component';
import { DoLoginComponent } from './login/do-login/do-login.component';
import { ShareComponent } from './dialogs/share/share.component';
import { MainBarComponent } from './main/main-bar/main-bar.component';
import { CommunityComponent } from './main/community/community.component';
import { NewCommunityComponent } from './main/new-community/new-community.component';
import { InfoComponent } from './dialogs/info/info.component';
import { HamburgerComponent } from './dialogs/hamburger/hamburger.component';
import { ListComponent } from './main/list/list.component';
import { DeliberationComponent } from './main/community/deliberation/deliberation.component';
import { MembersComponent } from './main/community/members/members.component';
import { UnverifiedComponent } from './main/community/unverified/unverified.component';
import { VerificationComponent } from './main/community/verification/verification.component';

import { HttpClientModule } from  '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgxQrcodeStylingModule } from 'ngx-qrcode-styling';
import { LOAD_WASM, NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';
import { MatDialogModule } from '@angular/material/dialog';

LOAD_WASM().subscribe();

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    ScanComponent,
    ProfileComponent,
    ShareComponent,
    GlokiComponent,
    StorageComponent,
    ConnectComponent,
    DoLoginComponent,
    MainBarComponent,
    CommunityComponent,
    NewCommunityComponent,
    InfoComponent,
    HamburgerComponent,
    ListComponent,
    DeliberationComponent,
    MembersComponent,
    UnverifiedComponent,
    VerificationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgxQrcodeStylingModule,
    NgxScannerQrcodeModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
