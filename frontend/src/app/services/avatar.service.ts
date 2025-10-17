import { Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../constants/app.constants';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AvatarService {
	readonly fallback = APP_CONSTANTS.DEFAULT_AVATAR_PLACEHOLDER;
	private readonly assetsUrl = environment.assetsUrl;

	resolve(avatarUrl?: string | null): string {
		if (!avatarUrl) {
			return this.fallback;
		}

		if (avatarUrl.startsWith('http')) {
			return avatarUrl;
		}

		const prefix = avatarUrl.startsWith('/') ? '' : '/';
		return `${this.assetsUrl}${prefix}${avatarUrl}`;
	}
}
