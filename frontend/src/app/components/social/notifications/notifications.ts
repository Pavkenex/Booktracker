import { Component, OnInit, OnDestroy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocialService } from '../../../services/social.service';
import { NotificationCount } from '../../../models/social.model';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';

@Component({
    selector: 'app-notifications',
    imports: [RouterModule, ClickOutsideDirective],
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notificationCount: NotificationCount = {
    friendRequests: 0,
    recommendations: 0,
    total: 0
  };
  
  showDropdown: boolean = false;
  isRefreshing: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private socialService: SocialService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.socialService.notificationCount$.subscribe(count => {
        this.notificationCount = count;
        this.isRefreshing = false;
      })
    );
    
    // Force an immediate refresh when component loads
    this.socialService.forceRefreshNotifications();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  refreshNotifications(): void {
    this.isRefreshing = true;
    this.socialService.forceRefreshNotifications();
    
    // Reset refreshing state after a short delay if no update comes
    setTimeout(() => {
      this.isRefreshing = false;
    }, 2000);
  }
}