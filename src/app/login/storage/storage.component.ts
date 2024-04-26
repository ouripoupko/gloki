import { Component } from '@angular/core';
import { StateService } from '../state.service';
import { GlokiService } from 'src/app/gloki.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrl: './storage.component.scss'
})
export class StorageComponent {

  selectedServer: string = '';
  showInfo: boolean = false;
  autocompleteVisible: boolean = false;
  cachedOptions: string[] = [];
  originalOptions = [
    'https://gdi.gloki.contact',
//    'http://localhost:5001'
  ];
  options: string[] = [];
  mayContinue = false;
  storageKey = 'gloki_ibc_url_list';
  errorMessage: string = '';

  constructor (
    private state: StateService,
    private gloki: GlokiService,
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
        this.cachedOptions.push(this.selectedServer);
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.cachedOptions));
        this.state.agentExists = result;
        this.state.step = result ? 4 : 3;
        this.state.isLoading = false;
      },
      error: error => {
        this.errorMessage = 'Bad response. Please type another address.';
        this.state.isLoading = false;
      }
    });
  }

  delayedHide() {
    setTimeout (()=>{this.autocompleteVisible = false}, 100);
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
  
}
