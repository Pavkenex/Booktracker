import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, RegisterRequest } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    const loginRequest: LoginRequest = {
      usernameOrEmail: 'testuser',
      password: 'password123'
    };

    const mockResponse = {
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        isAdmin: false
      }
    };

    service.login(loginRequest).subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.token).toBe('mock-jwt-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginRequest);
    req.flush(mockResponse);
  });

  it('should register successfully', () => {
    const registerRequest: RegisterRequest = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123'
    };

    const mockResponse = {
      success: true,
      message: 'Registration successful'
    };

    service.register(registerRequest).subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.message).toBe('Registration successful');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registerRequest);
    req.flush(mockResponse);
  });

  it('should logout successfully', () => {
    // Set up authenticated state
    localStorage.setItem('booktracker_token', 'mock-token');
    localStorage.setItem('booktracker_user', JSON.stringify({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      isAdmin: false
    }));

    service.logout();

    expect(localStorage.getItem('booktracker_token')).toBeNull();
    expect(localStorage.getItem('booktracker_user')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should get token from localStorage', () => {
    const mockToken = 'mock-jwt-token';
    localStorage.setItem('booktracker_token', mockToken);

    expect(service.getToken()).toBe(mockToken);
  });

  it('should return null when no token exists', () => {
    expect(service.getToken()).toBeNull();
  });
});