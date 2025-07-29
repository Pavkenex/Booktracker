import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LibraryEventsService {
  private libraryUpdatedSubject = new Subject<void>();
  
  // Observable that components can subscribe to
  libraryUpdated$ = this.libraryUpdatedSubject.asObservable();

  // Method to notify that library has been updated
  notifyLibraryUpdated(): void {
    this.libraryUpdatedSubject.next();
  }
}