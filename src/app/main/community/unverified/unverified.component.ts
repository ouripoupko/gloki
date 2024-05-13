import { Component, EventEmitter, Output } from '@angular/core';
import { GlokiService } from 'src/app/services/gloki.service';

@Component({
  selector: 'app-unverified',
  templateUrl: './unverified.component.html',
  styleUrl: './unverified.component.scss'
})
export class UnverifiedComponent {

  @Output() joinAuthentication = new EventEmitter<void>();

}
