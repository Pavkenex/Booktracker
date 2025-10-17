import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LibraryEvents {
  private libraryUpdatedSubject = new Subject<void>();
  
  libraryUpdated$ = this.libraryUpdatedSubject.asObservable();

  notifyLibraryUpdated(): void {
    this.libraryUpdatedSubject.next();
  }
}
