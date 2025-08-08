import { Routes } from "@angular/router";
import { AuthGuard, GuestGuard, AdminGuard } from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/home",
    pathMatch: "full",
  },
  {
    path: "home",
    loadComponent: () =>
      import("./components/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "login",
    loadComponent: () =>
      import("./components/auth/login/login.component").then(
        (m) => m.LoginComponent
      ),
    canActivate: [GuestGuard],
  },
  {
    path: "register",
    loadComponent: () =>
      import("./components/auth/register/register.component").then(
        (m) => m.RegisterComponent
      ),
    canActivate: [GuestGuard],
  },
  {
    path: "forgot-password",
    loadComponent: () =>
      import(
        "./components/auth/forgot-password/forgot-password.component"
      ).then((m) => m.ForgotPasswordComponent),
    canActivate: [GuestGuard],
  },
  {
    path: "reset-password",
    loadComponent: () =>
      import("./components/auth/reset-password/reset-password.component").then(
        (m) => m.ResetPasswordComponent
      ),
    canActivate: [GuestGuard],
  },
  {
    path: "books",
    loadComponent: () =>
      import("./components/book/book-catalog/book-catalog.component").then(
        (m) => m.BookCatalogComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "books/:id",
    loadComponent: () =>
      import("./components/book/book-details/book-details.component").then(
        (m) => m.BookDetailsComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "library",
    loadComponent: () =>
      import(
        "./components/library/personal-library/personal-library.component"
      ).then((m) => m.PersonalLibraryComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "library/user/:userId/:userName",
    loadComponent: () =>
      import("./components/library/user-library/user-library.component").then(
        (m) => m.UserLibraryComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "social",
    loadComponent: () =>
      import(
        "./components/social/social-dashboard/social-dashboard.component"
      ).then((m) => m.SocialDashboardComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "social/friends",
    loadComponent: () =>
      import("./components/social/friends-list/friends-list.component").then(
        (m) => m.FriendsListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "social/friend-requests",
    loadComponent: () =>
      import(
        "./components/social/friend-requests/friend-requests.component"
      ).then((m) => m.FriendRequestsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "social/recommendations",
    loadComponent: () =>
      import(
        "./components/social/recommendations/recommendations.component"
      ).then((m) => m.RecommendationsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "admin",
    loadComponent: () =>
      import(
        "./components/admin/admin-dashboard/admin-dashboard.component"
      ).then((m) => m.AdminDashboardComponent),
    canActivate: [AdminGuard],
  },
  {
    path: "admin/books",
    loadComponent: () =>
      import(
        "./components/admin/book-management/book-management.component"
      ).then((m) => m.BookManagementComponent),
    canActivate: [AdminGuard],
  },
  {
    path: "admin/genres",
    loadComponent: () =>
      import(
        "./components/admin/genre-management/genre-management.component"
      ).then((m) => m.GenreManagementComponent),
    canActivate: [AdminGuard],
  },
  {
    path: "admin/reports",
    loadComponent: () =>
      import("./components/admin/reports-panel/reports-panel.component").then(
        (m) => m.ReportsPanelComponent
      ),
    canActivate: [AdminGuard],
  },
  {
    path: "admin/popularity",
    loadComponent: () =>
      import(
        "./components/admin/popularity-statistics/popularity-statistics.component"
      ).then((m) => m.PopularityStatisticsComponent),
    canActivate: [AdminGuard],
  },
  {
    path: "**",
    redirectTo: "/home",
  },
];
