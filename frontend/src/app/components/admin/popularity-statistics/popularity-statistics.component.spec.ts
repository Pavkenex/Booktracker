import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { of, throwError } from "rxjs";
import { PopularityStatisticsComponent } from "./popularity-statistics.component";
import {
  AdminService,
  PopularityStatistics,
} from "../../../services/admin.service";

describe("PopularityStatisticsComponent", () => {
  let component: PopularityStatisticsComponent;
  let fixture: ComponentFixture<PopularityStatisticsComponent>;
  let mockAdminService: jasmine.SpyObj<AdminService>;

  const mockStatistics: PopularityStatistics[] = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      viewCount: 150,
      thumbnail: "https://example.com/gatsby.jpg",
      rating: 4.2,
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      viewCount: 120,
      thumbnail: "https://example.com/mockingbird.jpg",
      rating: 4.5,
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      viewCount: 100,
      thumbnail: "https://example.com/1984.jpg",
      rating: 4.3,
    },
  ];

  beforeEach(async () => {
    const adminServiceSpy = jasmine.createSpyObj("AdminService", [
      "getPopularityStatistics",
      "exportPopularityStatistics",
    ]);

    await TestBed.configureTestingModule({
      imports: [PopularityStatisticsComponent, FormsModule],
      providers: [{ provide: AdminService, useValue: adminServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(PopularityStatisticsComponent);
    component = fixture.componentInstance;
    mockAdminService = TestBed.inject(
      AdminService
    ) as jasmine.SpyObj<AdminService>;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should load statistics on initialization", () => {
      mockAdminService.getPopularityStatistics.and.returnValue(
        of(mockStatistics)
      );

      component.ngOnInit();

      expect(mockAdminService.getPopularityStatistics).toHaveBeenCalled();
      expect(component.statistics).toEqual(mockStatistics);
      expect(component.loading).toBeFalse();
    });

    it("should handle error when loading statistics fails", () => {
      const errorMessage = "Network error";
      mockAdminService.getPopularityStatistics.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      component.ngOnInit();

      expect(component.error).toBe(
        "Failed to load popularity statistics. Please try again."
      );
      expect(component.loading).toBeFalse();
    });
  });

  describe("loadStatistics", () => {
    it("should set loading to true initially", () => {
      mockAdminService.getPopularityStatistics.and.returnValue(
        of(mockStatistics)
      );

      component.loadStatistics();

      expect(component.loading).toBeFalse(); // Will be false after successful load
      expect(component.error).toBeNull();
    });

    it("should clear previous error when reloading", () => {
      component.error = "Previous error";
      mockAdminService.getPopularityStatistics.and.returnValue(
        of(mockStatistics)
      );

      component.loadStatistics();

      expect(component.error).toBeNull();
    });
  });

  describe("applyFilters", () => {
    beforeEach(() => {
      component.statistics = mockStatistics;
    });

    it("should filter by search term (title)", () => {
      component.searchTerm = "gatsby";

      component.applyFilters();

      expect(component.filteredStatistics.length).toBe(1);
      expect(component.filteredStatistics[0].title).toBe("The Great Gatsby");
    });

    it("should filter by search term (author)", () => {
      component.searchTerm = "orwell";

      component.applyFilters();

      expect(component.filteredStatistics.length).toBe(1);
      expect(component.filteredStatistics[0].author).toBe("George Orwell");
    });

    it("should be case insensitive when filtering", () => {
      component.searchTerm = "GATSBY";

      component.applyFilters();

      expect(component.filteredStatistics.length).toBe(1);
      expect(component.filteredStatistics[0].title).toBe("The Great Gatsby");
    });

    it("should sort by view count (default)", () => {
      component.sortBy = "viewCount";

      component.applyFilters();

      expect(component.filteredStatistics[0].viewCount).toBe(150);
      expect(component.filteredStatistics[1].viewCount).toBe(120);
      expect(component.filteredStatistics[2].viewCount).toBe(100);
    });

    it("should sort by view count ascending", () => {
      component.sortBy = "viewCountAsc";

      component.applyFilters();

      expect(component.filteredStatistics[0].viewCount).toBe(100);
      expect(component.filteredStatistics[1].viewCount).toBe(120);
      expect(component.filteredStatistics[2].viewCount).toBe(150);
    });

    it("should sort by title alphabetically", () => {
      component.sortBy = "title";

      component.applyFilters();

      expect(component.filteredStatistics[0].title).toBe("1984");
      expect(component.filteredStatistics[1].title).toBe("The Great Gatsby");
      expect(component.filteredStatistics[2].title).toBe(
        "To Kill a Mockingbird"
      );
    });

    it("should sort by author alphabetically", () => {
      component.sortBy = "author";

      component.applyFilters();

      expect(component.filteredStatistics[0].author).toBe(
        "F. Scott Fitzgerald"
      );
      expect(component.filteredStatistics[1].author).toBe("George Orwell");
      expect(component.filteredStatistics[2].author).toBe("Harper Lee");
    });

    it("should limit results when displayLimit is set", () => {
      component.displayLimit = "2";

      component.applyFilters();

      expect(component.filteredStatistics.length).toBe(2);
    });

    it('should show all results when displayLimit is "all"', () => {
      component.displayLimit = "all";

      component.applyFilters();

      expect(component.filteredStatistics.length).toBe(3);
    });

    it("should combine search and sort filters", () => {
      // Add more books with similar names to test combination
      component.statistics = [
        ...mockStatistics,
        {
          id: 4,
          title: "The Great Adventure",
          author: "John Doe",
          viewCount: 80,
          rating: 3.8,
        },
      ];
      component.searchTerm = "great";
      component.sortBy = "viewCountAsc";

      component.applyFilters();

      expect(component.filteredStatistics.length).toBe(2);
      expect(component.filteredStatistics[0].viewCount).toBe(80); // Lower count first
      expect(component.filteredStatistics[1].viewCount).toBe(150);
    });
  });

  describe("clearFilters", () => {
    it("should reset all filter values to defaults", () => {
      component.searchTerm = "test";
      component.sortBy = "title";
      component.displayLimit = "10";

      component.clearFilters();

      expect(component.searchTerm).toBe("");
      expect(component.sortBy).toBe("viewCount");
      expect(component.displayLimit).toBe("25");
    });

    it("should reapply filters after clearing", () => {
      component.statistics = mockStatistics;
      component.searchTerm = "gatsby";
      component.applyFilters();
      expect(component.filteredStatistics.length).toBe(1);

      component.clearFilters();

      expect(component.filteredStatistics.length).toBe(3);
    });
  });

  describe("exportData", () => {
    it("should call admin service to export CSV", () => {
      const mockBlob = new Blob(["csv data"], { type: "text/csv" });
      mockAdminService.exportPopularityStatistics.and.returnValue(of(mockBlob));

      // Mock URL.createObjectURL and related methods
      spyOn(window.URL, "createObjectURL").and.returnValue("mock-url");
      spyOn(window.URL, "revokeObjectURL");
      spyOn(document, "createElement").and.returnValue({
        href: "",
        download: "",
        click: jasmine.createSpy("click"),
        remove: jasmine.createSpy("remove"),
      } as any);
      spyOn(document.body, "appendChild");
      spyOn(document.body, "removeChild");

      component.exportData("csv");

      expect(mockAdminService.exportPopularityStatistics).toHaveBeenCalledWith(
        "csv"
      );
      expect(component.exportStatus.show).toBeTrue();
    });

    it("should call admin service to export PDF", () => {
      const mockBlob = new Blob(["pdf data"], { type: "application/pdf" });
      mockAdminService.exportPopularityStatistics.and.returnValue(of(mockBlob));

      // Mock URL.createObjectURL and related methods
      spyOn(window.URL, "createObjectURL").and.returnValue("mock-url");
      spyOn(window.URL, "revokeObjectURL");
      spyOn(document, "createElement").and.returnValue({
        href: "",
        download: "",
        click: jasmine.createSpy("click"),
        remove: jasmine.createSpy("remove"),
      } as any);
      spyOn(document.body, "appendChild");
      spyOn(document.body, "removeChild");

      component.exportData("pdf");

      expect(mockAdminService.exportPopularityStatistics).toHaveBeenCalledWith(
        "pdf"
      );
      expect(component.exportStatus.show).toBeTrue();
    });

    it("should handle export error", () => {
      mockAdminService.exportPopularityStatistics.and.returnValue(
        throwError(() => new Error("Export failed"))
      );

      component.exportData("csv");

      expect(component.exportStatus.show).toBeTrue();
      expect(component.exportStatus.message).toContain("Failed to export CSV");
    });
  });

  describe("onImageError", () => {
    it("should set placeholder image on error", () => {
      const mockEvent = {
        target: {
          src: "original-url",
        },
      };

      component.onImageError(mockEvent);

      expect(mockEvent.target.src).toBe("/assets/images/book-placeholder.svg");
    });
  });

  describe("template rendering", () => {
    beforeEach(() => {
      mockAdminService.getPopularityStatistics.and.returnValue(
        of(mockStatistics)
      );
      fixture.detectChanges();
    });

    it("should display loading state initially", () => {
      component.loading = true;
      fixture.detectChanges();

      const loadingElement =
        fixture.nativeElement.querySelector(".spinner-border");
      expect(loadingElement).toBeTruthy();
    });

    it("should display error state when error occurs", () => {
      component.loading = false;
      component.error = "Test error";
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector(".alert-danger");
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain("Test error");
    });

    it("should display empty state when no statistics", () => {
      component.loading = false;
      component.error = null;
      component.filteredStatistics = [];
      fixture.detectChanges();

      const emptyStateElement =
        fixture.nativeElement.querySelector(".text-center.py-5");
      expect(emptyStateElement).toBeTruthy();
      expect(emptyStateElement.textContent).toContain(
        "No Statistics Available"
      );
    });

    it("should display statistics table when data is available", () => {
      component.loading = false;
      component.error = null;
      component.filteredStatistics = mockStatistics;
      fixture.detectChanges();

      const tableElement = fixture.nativeElement.querySelector(".table");
      expect(tableElement).toBeTruthy();

      const rows = fixture.nativeElement.querySelectorAll("tbody tr");
      expect(rows.length).toBe(3);
    });

    it("should display book information in table rows", () => {
      component.loading = false;
      component.error = null;
      component.filteredStatistics = mockStatistics;
      fixture.detectChanges();

      const firstRow = fixture.nativeElement.querySelector("tbody tr");
      expect(firstRow.textContent).toContain("The Great Gatsby");
      expect(firstRow.textContent).toContain("F. Scott Fitzgerald");
      expect(firstRow.textContent).toContain("150");
    });

    it("should show export buttons", () => {
      const exportButtons =
        fixture.nativeElement.querySelectorAll(".dropdown-item");
      expect(exportButtons.length).toBe(2);
      expect(exportButtons[0].textContent).toContain("Export as CSV");
      expect(exportButtons[1].textContent).toContain("Export as PDF");
    });
  });
});
