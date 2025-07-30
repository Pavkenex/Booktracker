import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SocialService } from './social.service';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

describe('SocialService', () => {
  let service: SocialService;
  let httpMock: HttpTestingController;
  let apiService: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SocialService, ApiService]
    });
    service = TestBed.inject(SocialService);
    httpMock = TestBed.inject(HttpTestingController);
    apiService = TestBed.inject(ApiService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get friends', () => {
    const mockFriends = [
      { id: 1, userId: 1, friendId: 2, status: 'accepted' as const, friend: { id: 2, username: 'friend1', email: 'friend1@test.com', isAdmin: false } }
    ];

    service.getFriends().subscribe(friends => {
      expect(friends).toEqual(mockFriends);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/friends`);
    expect(req.request.method).toBe('GET');
    req.flush(mockFriends);
  });

  it('should send friend request', () => {
    const request = { friendId: 2 };
    const mockResponse = { success: true };

    service.sendFriendRequest(request).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/friends/request`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);
  });

  it('should get notification count', () => {
    const mockCount = { friendRequests: 2, recommendations: 1, total: 3 };

    service.getNotificationCount().subscribe(count => {
      expect(count).toEqual(mockCount);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/notifications/count`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCount);
  });
});