import { Component } from '@angular/core';
import { StateService } from '../state.service';
import { GlokiService } from 'src/app/services/gloki.service';
import { MatDialog } from '@angular/material/dialog';
import { InfoComponent } from 'src/app/dialogs/info/info.component';
import { ScanComponent } from 'src/app/dialogs/scan/scan.component';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrl: './storage.component.scss'
})
export class StorageComponent {

  selectedServer: string = '';
  autocompleteVisible: boolean = false;
  cachedOptions: string[] = [];
  originalOptions = [
    'https://gdi.gloki.contact',
    'http://localhost:5001'
  ];
  options: string[] = [];
  mayContinue = false;
  storageKey = 'gloki_ibc_url_list';
  errorMessage: string = '';

  constructor (
    private state: StateService,
    private gloki: GlokiService,
    public dialog: MatDialog
  ) {
    this.cachedOptions = JSON.parse(window.localStorage.getItem(this.storageKey) ?? '[]');
    this.options = [...this.cachedOptions, ...this.originalOptions];
  }

  selectOption(option: string) {
    this.selectedServer = option.replace(/<b>|<\/b>/gi,'');
    this.autocompleteVisible = false;
    this.mayContinue = this.isValidHttpUrl();
  }

  onServerSelected(event: any) {
    this.state.isLoading = true;
    this.gloki.setServer(this.selectedServer, this.state.key).subscribe({
      next: result => {
        if (!this.cachedOptions.includes(this.selectedServer) && !this.originalOptions.includes(this.selectedServer)) {
          this.cachedOptions.push(this.selectedServer);
        }
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.cachedOptions));
        this.state.step = result ? 4 : 3;
        this.state.isLoading = false;
      },
      error: error => {
        this.errorMessage = 'Bad response. Please type another address.';
        this.state.isLoading = false;
        this.mayContinue = false;
      }
    });
  }

  delayedHide() {
    setTimeout (()=>{this.autocompleteVisible = false}, 300);
  }

  onServerChange() {
    this.errorMessage = '';
    this.mayContinue = this.isValidHttpUrl();
    this.options = [...this.cachedOptions, ...this.originalOptions];
    this.options = this.options.
      filter((opt) => opt.includes(this.selectedServer)).
      map((opt) => opt.replace(new RegExp(this.selectedServer, "gi"), `<b>${this.selectedServer}</b>`));
  }

  isValidHttpUrl() {
    try {
      const url = new URL(this.selectedServer);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (err) {
      return false;
    }
  }
  
  showInfo() {
    this.dialog.open(InfoComponent, {
      panelClass: 'info-box',
      backdropClass: 'dialog-backdrop',
      data: {
        header: 'What is IBC?',
        summary: 'Your gloKi connects to your own personal blockchain.',
        content: 'Identity Blockchain (IBC) is a personal blockchain. You store your personal profile and all your personal information on an IBC. You access your data with your gloKi.'
      }
    });
  }

  doScan () {
    const dialogRef = this.dialog.open(ScanComponent, {
      panelClass: 'scan-box',
      backdropClass: 'dialog-backdrop',
      data: {
        testResult: (result: string) => result,
        resultHeader: 'IBC Address:',
        resultStringify: (result: string) => result
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      this.selectedServer = result;
      this.mayContinue = this.isValidHttpUrl();
    });
  }
}
