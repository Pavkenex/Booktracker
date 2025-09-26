import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { User } from '../../../services/auth-store';

@Component({
    selector: 'app-home-hero',
    imports: [CommonModule, RouterModule],
    templateUrl: './home-hero.html',
    styleUrls: ['./home-hero.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeHeroComponent {
  @Input({ required: true }) isAuthenticated$!: Observable<boolean>;
  @Input({ required: true }) currentUser$!: Observable<User | null>;
}
