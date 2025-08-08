import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of, throwError, Subject } from "rxjs";
import { BookDetailsComponent } from "./book-details.component";
import { BookService } from "../../../services/book.service";
import { LibraryService } from "../../../services/library.service";
import { AuthService } from "../../../services/auth.service";
import { LibraryEventsService } from "../../../services/library-events.service";
import { Book } from "../../../models/book.model";
import { UserBook } from "../../../models/library.model";

describe("BookDetailsComponent", () => {
  let component: BookDetailsComponent;
  let fixture: ComponentFixture<BookDetailsComponent>;
  let mockBookService: jasmine.SpyObj<BookService>;
  let mockLibraryService: jasmine.SpyObj<LibraryService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockLibraryEventsService: jasmine.SpyObj<LibraryEventsService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockBook: Book = {
    id: 1,
    title: "Test Book",
    author: "Test Author",
    publishedYear: 2023,
    description: "Test description",
    thumbnail: "test-thumbnail.jpg",
    genres: [{ id: 1, name: "Fiction" }],
  };

  const mockUserBook: UserBook = {
    id: 1,
    book: mockBook,
    status: "to_read",
    isFavourite: false,
  };

  beforeEach(async () => {
    const bookServiceSpy = jasmine.createSpyObj("BookService", [
      "getBookById",
      "recordBookView",
    ]);
    const libraryServiceSpy = jasmine.createSpyObj("LibraryService", [
      "checkBookInLibrary",
      "addBookToLibrary",
      "removeBookFromLibrary",
      "toggleFavorite",
    ]);
    const authServiceSpy = jasmine.createSpyObj(
      "AuthService",
      ["isAuthenticated"],
      {
        isAuthenticated$: of(false),
      }
    );
    const libraryEventsServiceSpy = jasmine.createSpyObj(
      "LibraryEventsService",
      ["notifyLibraryUpdated"]
    );
    const routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    const paramsSubject = new Subject();
    mockActivatedRoute = {
      params: paramsSubject.asObservable(),
      snapshot: { params: { id: "1" } },
    };

    await TestBed.configureTestingModule({
      imports: [BookDetailsComponent],
      providers: [
        { provide: BookService, useValue: bookServiceSpy },
        { provide: LibraryService, useValue: libraryServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LibraryEventsService, useValue: libraryEventsServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookDetailsComponent);
    component = fixture.componentInstance;
    mockBookService = TestBed.inject(
      BookService
    ) as jasmine.SpyObj<BookService>;
    mockLibraryService = TestBed.inject(
      LibraryService
    ) as jasmine.SpyObj<LibraryService>;
    mockAuthService = TestBed.inject(
      AuthService
    ) as jasmine.SpyObj<AuthService>;
    mockLibraryEventsService = TestBed.inject(
      LibraryEventsService
    ) as jasmine.SpyObj<LibraryEventsService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    // Setup default mock responses
    mockBookService.getBookById.and.returnValue(of(mockBook));
    mockBookService.recordBookView.and.returnValue(of(void 0));
    mockLibraryService.checkBookInLibrary.and.returnValue(
      of({ hasBook: false, userBook: undefined })
    );
    mockAuthService.isAuthenticated.and.returnValue(false);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("View Tracking", () => {
    it("should record book view when book is loaded successfully", () => {
      // Arrange
      mockBookService.getBookById.and.returnValue(of(mockBook));
      mockBookService.recordBookView.and.returnValue(of(void 0));

      // Act
      component.loadBook(1);

      // Assert
      expect(mockBookService.recordBookView).toHaveBeenCalledWith(1);
      expect(mockBookService.recordBookView).toHaveBeenCalledTimes(1);
    });

    it("should record view only once per page visit", () => {
      // Arrange
      mockBookService.getBookById.and.returnValue(of(mockBook));
      mockBookService.recordBookView.and.returnValue(of(void 0));

      // Act - load book multiple times
      component.loadBook(1);
      component.loadBook(1);
      component.loadBook(1);

      // Assert - view should only be recorded once
      expect(mockBookService.recordBookView).toHaveBeenCalledTimes(1);
    });

    it("should handle view recording errors silently without affecting user experience", () => {
      // Arrange
      mockBookService.getBookById.and.returnValue(of(mockBook));
      mockBookService.recordBookView.and.returnValue(
        throwError(() => new Error("View recording failed"))
      );
      spyOn(console, "warn");

      // Act
      component.loadBook(1);

      // Assert
      expect(component.book).toEqual(mockBook); // Book should still be loaded
      expect(component.error).toBeNull(); // No error should be shown to user
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to record book view:",
        jasmine.any(Error)
      );
    });

    it("should not record view if book loading fails", () => {
      // Arrange
      mockBookService.getBookById.and.returnValue(
        throwError(() => new Error("Book not found"))
      );

      // Act
      component.loadBook(1);

      // Assert
      expect(mockBookService.recordBookView).not.toHaveBeenCalled();
      expect(component.error).toBe(
        "Failed to load book details. Please try again."
      );
    });

    it("should reset view tracking when navigating to different book", () => {
      // Arrange
      mockBookService.getBookById.and.returnValue(of(mockBook));
      mockBookService.recordBookView.and.returnValue(of(void 0));

      // Create a new Subject for params to control the emission
      const paramsSubject = new Subject();
      mockActivatedRoute.params = paramsSubject.asObservable();

      // Act - initialize component
      component.ngOnInit();

      // Simulate first book load
      paramsSubject.next({ id: "1" });

      // Simulate navigation to different book
      paramsSubject.next({ id: "2" });

      // Assert - view should be recorded for both books
      expect(mockBookService.recordBookView).toHaveBeenCalledWith(1);
      expect(mockBookService.recordBookView).toHaveBeenCalledWith(2);
      expect(mockBookService.recordBookView).toHaveBeenCalledTimes(2);
    });
  });

  describe("Book Loading", () => {
    it("should load book details successfully", () => {
      // Arrange
      mockBookService.getBookById.and.returnValue(of(mockBook));

      // Act
      component.loadBook(1);

      // Assert
      expect(mockBookService.getBookById).toHaveBeenCalledWith(1);
      expect(component.book).toEqual(mockBook);
      expect(component.error).toBeNull();
    });

    it("should handle book loading errors", () => {
      // Arrange
      const error = new Error("Book not found");
      mockBookService.getBookById.and.returnValue(throwError(() => error));
      spyOn(console, "error");

      // Act
      component.loadBook(1);

      // Assert
      expect(component.book).toBeNull();
      expect(component.error).toBe(
        "Failed to load book details. Please try again."
      );
      expect(console.error).toHaveBeenCalledWith("Error loading book:", error);
    });
  });

  describe("Library Status", () => {
    it("should check library status for authenticated users", () => {
      // Arrange
      mockAuthService.isAuthenticated.and.returnValue(true);
      mockLibraryService.checkBookInLibrary.and.returnValue(
        of({ hasBook: true, userBook: mockUserBook })
      );

      // Act
      component.loadBook(1);

      // Assert
      expect(mockLibraryService.checkBookInLibrary).toHaveBeenCalledWith(1);
      expect(component.userBook).toEqual(mockUserBook);
    });

    it("should not check library status for unauthenticated users", () => {
      // Arrange
      mockAuthService.isAuthenticated.and.returnValue(false);

      // Act
      component.loadBook(1);

      // Assert
      expect(mockLibraryService.checkBookInLibrary).not.toHaveBeenCalled();
      expect(component.userBook).toBeNull();
    });
  });
});
