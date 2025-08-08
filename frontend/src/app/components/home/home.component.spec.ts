import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";

import { HomeComponent } from "./home.component";
import { AuthService } from "../../services/auth.service";
import { SocialService } from "../../services/social.service";
import { BookService } from "../../services/book.service";

describe("HomeComponent", () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockSocialService: jasmine.SpyObj<SocialService>;
  let mockBookService: jasmine.SpyObj<BookService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj(
      "AuthService",
      ["isAuthenticated"],
      {
        isAuthenticated$: of(false),
        currentUser$: of(null),
      }
    );
    const socialServiceSpy = jasmine.createSpyObj("SocialService", [
      "getRecommendations",
      "markRecommendationAsRead",
    ]);
    const bookServiceSpy = jasmine.createSpyObj("BookService", [
      "getPopularBooks",
    ]);

    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: SocialService, useValue: socialServiceSpy },
        { provide: BookService, useValue: bookServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(
      AuthService
    ) as jasmine.SpyObj<AuthService>;
    mockSocialService = TestBed.inject(
      SocialService
    ) as jasmine.SpyObj<SocialService>;
    mockBookService = TestBed.inject(
      BookService
    ) as jasmine.SpyObj<BookService>;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should display popular books section", () => {
    fixture.detectChanges();
    const popularBooksSection = fixture.nativeElement.querySelector(
      "app-popular-books-section"
    );
    expect(popularBooksSection).toBeTruthy();
  });

  it("should display welcome message for unauthenticated users", () => {
    mockAuthService.isAuthenticated$ = of(false);
    fixture.detectChanges();

    const welcomeMessage = fixture.nativeElement.querySelector(".display-4");
    expect(welcomeMessage.textContent.trim()).toBe("Welcome to BookTracker");
  });

  it("should display personalized welcome for authenticated users", () => {
    mockAuthService.isAuthenticated$ = of(true);
    mockAuthService.currentUser$ = of({
      id: 1,
      username: "testuser",
      email: "test@example.com",
      isAdmin: false,
    });

    fixture.detectChanges();

    const welcomeMessage = fixture.nativeElement.querySelector(".display-4");
    expect(welcomeMessage.textContent.trim()).toBe("Welcome back, testuser!");
  });

  it("should show recommendations section for authenticated users", () => {
    mockAuthService.isAuthenticated$ = of(true);
    mockSocialService.getRecommendations.and.returnValue(of([]));

    fixture.detectChanges();

    const recommendationsSection = fixture.nativeElement.querySelector("h3");
    expect(recommendationsSection.textContent.trim()).toBe(
      "Recent Book Recommendations"
    );
  });

  it("should not show recommendations section for unauthenticated users", () => {
    mockAuthService.isAuthenticated$ = of(false);

    fixture.detectChanges();

    const recommendationsSection = fixture.nativeElement.querySelector("h3");
    expect(recommendationsSection).toBeFalsy();
  });
});
