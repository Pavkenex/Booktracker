import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastNotificationsComponent } from './components/shared/toast-notifications/toast-notifications';
import { NavbarComponent } from './components/shared/navbar/navbar.component';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, NavbarComponent, ToastNotificationsComponent],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'booktracker-frontend';
}
