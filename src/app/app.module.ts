import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { ScanComponent } from './scan/scan.component';
import { ProfileComponent } from './profile/profile.component';
import { GlokiComponent } from './login/gloki/gloki.component';
import { StorageComponent } from './login/storage/storage.component';
import { ConnectComponent } from './login/connect/connect.component';
import { DoLoginComponent } from './login/do-login/do-login.component';

import { HttpClientModule } from  '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgxQrcodeStylingModule } from 'ngx-qrcode-styling';
import { ShareComponent } from './share/share.component';
import { NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';
import { MainBarComponent } from './main-bar/main-bar.component';
import { CommunityComponent } from './community/community.component';

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
    CommunityComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgxQrcodeStylingModule,
    NgxScannerQrcodeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
