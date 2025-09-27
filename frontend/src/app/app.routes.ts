import { Routes } from "@angular/router";
import { AuthGuard, GuestGuard, AdminGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/home",
    pathMatch: "full",
  },
  {
    path: "home",
    loadComponent: () =>
      import("./components/home/home").then((m) => m.HomeComponent),
  },
  {
    path: "login",
    loadComponent: () =>
      import("./components/auth/login/login").then(
        (m) => m.LoginComponent
      ),
    canActivate: [GuestGuard],
  },
  {
    path: "register",
    loadComponent: () =>
      import("./components/auth/register/register").then(
        (m) => m.RegisterComponent
      ),
    canActivate: [GuestGuard],
  },
  {
    path: "forgot-password",
    loadComponent: () =>
      import(
        "./components/auth/forgot-password/forgot-password"
      ).then((m) => m.ForgotPasswordComponent),
    canActivate: [GuestGuard],
  },
  {
    path: "reset-password",
    loadComponent: () =>
      import("./components/auth/reset-password/reset-password").then(
        (m) => m.ResetPasswordComponent
      ),
    canActivate: [GuestGuard],
  },
  {
    path: "books",
    loadComponent: () =>
      import("./components/book/book-catalog/book-catalog").then(
        (m) => m.BookCatalogComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "books/:id",
    loadComponent: () =>
      import("./components/book/book-details/book-details").then(
        (m) => m.BookDetailsComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "library",
    loadComponent: () =>
      import(
        "./components/library/personal-library/personal-library"
      ).then((m) => m.PersonalLibraryComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "library/user/:userId/:userName",
    loadComponent: () =>
      import("./components/library/user-library/user-library").then(
        (m) => m.UserLibraryComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "social",
    loadComponent: () =>
      import(
        "./components/social/social-dashboard/social-dashboard"
      ).then((m) => m.SocialDashboardComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "social/friends",
    loadComponent: () =>
      import("./components/social/friends-list/friends-list").then(
        (m) => m.FriendsListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "social/friend-requests",
    loadComponent: () =>
      import(
        "./components/social/friend-requests/friend-requests"
      ).then((m) => m.FriendRequestsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "social/recommendations",
    loadComponent: () =>
      import(
        "./components/social/recommendations/recommendations"
      ).then((m) => m.RecommendationsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "admin",
    loadComponent: () =>
      import(
        "./components/admin/admin-dashboard/admin-dashboard"
      ).then((m) => m.AdminDashboardComponent),
    canActivate: [AdminGuard],
  },
  {
    path: "admin/books",
    loadComponent: () =>
      import(
        "./components/admin/book-management/book-management"
      ).then((m) => m.BookManagementComponent),
    canActivate: [AdminGuard],
  },
  {
    path: "admin/genres",
    loadComponent: () =>
      import(
        "./components/admin/genre-management/genre-management"
      ).then((m) => m.GenreManagementComponent),
    canActivate: [AdminGuard],
  },
  {
    path: "admin/reports",
    loadComponent: () =>
      import("./components/admin/reports-panel/reports-panel").then(
        (m) => m.ReportsPanelComponent
      ),
    canActivate: [AdminGuard],
  },
  {
    path: "admin/popularity",
    loadComponent: () =>
      import(
        "./components/admin/popularity-statistics/popularity-statistics"
      ).then((m) => m.PopularityStatisticsComponent),
    canActivate: [AdminGuard],
  },
  {
    path: "profile",
    loadComponent: () =>
      import("./components/user/profile/profile").then(
        (m) => m.ProfileComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "**",
    redirectTo: "/home",
  },
];
