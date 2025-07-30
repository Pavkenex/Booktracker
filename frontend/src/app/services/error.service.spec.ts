import { TestBed } from '@angular/core/testing';
import { ErrorService, ErrorMessage } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add error message', (done) => {
    const testMessage = 'Test error message';
    
    service.errors$.subscribe(errors => {
      if (errors.length > 0) {
        expect(errors[0].message).toBe(testMessage);
        expect(errors[0].type).toBe('error');
        done();
      }
    });
    
    service.showError(testMessage);
  });

  it('should add success message', (done) => {
    const testMessage = 'Test success message';
    
    service.errors$.subscribe(errors => {
      if (errors.length > 0) {
        expect(errors[0].message).toBe(testMessage);
        expect(errors[0].type).toBe('success');
        done();
      }
    });
    
    service.showSuccess(testMessage);
  });

  it('should remove error by id', () => {
    service.showError('Test error 1');
    service.showError('Test error 2');
    
    let errorId: string;
    service.errors$.subscribe(errors => {
      if (errors.length === 2) {
        errorId = errors[0].id;
        service.removeError(errorId);
      } else if (errors.length === 1) {
        expect(errors.find(e => e.id === errorId)).toBeUndefined();
      }
    });
  });

  it('should clear all errors', () => {
    service.showError('Test error 1');
    service.showError('Test error 2');
    service.clearAllErrors();
    
    service.errors$.subscribe(errors => {
      expect(errors.length).toBe(0);
    });
  });

  it('should handle HTTP error responses', () => {
    const mockError = {
      status: 404,
      error: {
        message: 'Resource not found'
      }
    };
    
    const errorMessage = service.handleHttpError(mockError);
    expect(errorMessage).toBe('Resource not found');
  });

  it('should handle validation errors', () => {
    const mockValidationErrors = {
      username: 'Username is required',
      email: 'Invalid email format'
    };
    
    spyOn(service, 'showError');
    service.handleValidationErrors(mockValidationErrors);
    
    expect(service.showError).toHaveBeenCalledWith('username: Username is required');
    expect(service.showError).toHaveBeenCalledWith('email: Invalid email format');
  });
});