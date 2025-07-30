# Social Features Implementation

This directory contains the implementation of social features for the BookTracker application, including friend management, book recommendations, and notifications.

## Components

### 1. FriendsListComponent (`friends-list/`)
- **Purpose**: Manages user's friends and friend search functionality
- **Features**:
  - Display list of current friends
  - Search for new users to add as friends
  - Send friend requests
  - Remove friends
  - Responsive design with Bootstrap

### 2. FriendRequestsComponent (`friend-requests/`)
- **Purpose**: Handles incoming friend requests
- **Features**:
  - Display pending friend requests
  - Accept or decline friend requests
  - Real-time notification count updates
  - Time-based display of request age

### 3. RecommendationsComponent (`recommendations/`)
- **Purpose**: Manages book recommendations between friends
- **Features**:
  - View received recommendations
  - View sent recommendations
  - Send new book recommendations to friends
  - Add recommended books to personal library
  - Mark recommendations as read
  - Delete recommendations

### 4. NotificationsComponent (`notifications/`)
- **Purpose**: Displays notification counts and quick access to social features
- **Features**:
  - Real-time notification badge
  - Dropdown menu with quick links
  - Separate counts for friend requests and recommendations
  - Auto-refresh functionality

### 5. SocialDashboardComponent (`social-dashboard/`)
- **Purpose**: Main dashboard that combines all social features
- **Features**:
  - Tabbed interface for different social features
  - Notification count display
  - Responsive navigation

## Services

### SocialService (`../../../services/social.service.ts`)
- **Purpose**: Handles all social-related API calls
- **Key Methods**:
  - `getFriends()`: Retrieve user's friends
  - `sendFriendRequest()`: Send friend request
  - `getFriendRequests()`: Get pending friend requests
  - `respondToFriendRequest()`: Accept/decline friend requests
  - `getRecommendations()`: Get received recommendations
  - `sendRecommendation()`: Send book recommendation
  - `getNotificationCount()`: Get notification counts
  - `refreshNotifications()`: Refresh notification state

## Models

### Social Models (`../../../models/social.model.ts`)
- `User`: Basic user information
- `Friendship`: Friend relationship data
- `FriendRequest`: Friend request with sender/receiver info
- `Recommendation`: Book recommendation with message
- `NotificationCount`: Notification count structure
- Various request/response interfaces

## Routes

The following routes are configured for social features:
- `/social` - Main social dashboard
- `/social/friends` - Friends list
- `/social/friend-requests` - Friend requests
- `/social/recommendations` - Book recommendations

## Integration

### Navigation Integration
- Added "Social" link to main navigation
- Added notifications component to navbar
- Updated user dropdown menu

### API Integration
- Uses existing `ApiService` for HTTP requests
- Integrates with `LibraryService` for adding recommended books
- Follows existing authentication patterns

## Requirements Fulfilled

This implementation addresses the following requirements from the specification:

- **5.1**: Friend request system (send/receive/accept/decline)
- **5.2**: Friend relationship management
- **5.3**: Friend search functionality
- **5.4**: Book recommendation system between friends
- **5.5**: Private messaging foundation (UI ready, backend needed)
- **5.6**: Friend list management
- **5.7**: Notification system for social interactions

## Usage

1. **Adding Friends**:
   - Navigate to Social → Friends
   - Click "Add Friends" to search for users
   - Send friend requests to desired users

2. **Managing Friend Requests**:
   - Check notification badge for pending requests
   - Navigate to Social → Friend Requests
   - Accept or decline pending requests

3. **Book Recommendations**:
   - Navigate to Social → Recommendations
   - Use "Send New" tab to recommend books from your library
   - View received recommendations and add books to your library

4. **Notifications**:
   - Click the bell icon in the navbar
   - View quick summary of pending social activities
   - Click items to navigate to relevant sections

## Technical Notes

- All components are standalone Angular components
- Uses Bootstrap 5 for styling
- Implements responsive design for mobile devices
- Uses RxJS for reactive state management
- Includes proper error handling and loading states
- TypeScript interfaces ensure type safety