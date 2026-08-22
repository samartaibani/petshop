import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, getIdToken, sendPasswordResetEmail } from 'firebase/auth';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // NOTE: Populate environment.ts with Firebase Config
  private app = initializeApp(environment.firebaseConfig);
  private auth = getAuth(this.app);

  private userSub = new BehaviorSubject<User | null>(null);
  user$ = this.userSub.asObservable();

  private roleSub = new BehaviorSubject<number | null>(null);
  role$ = this.roleSub.asObservable();

  constructor(private router: Router) {
    onAuthStateChanged(this.auth, async (user) => {
      this.userSub.next(user);
      if (user) {
        // We get role from Backend usually, or Custom Claims. 
        // For this task, we will fetch role from Backend upon Login/PageLoad in a real app.
        // Or we can simple store it in localStorage for quick access (Basic Security).
        // A better way is to fetch profile from API.
        const role = localStorage.getItem('role');
        this.roleSub.next(role ? Number(role) : 0);
      } else {
        this.roleSub.next(null);
      }
    });
  }

  // Login: Returns the UserCredential, component will handle API call to get Role
  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  resetPassword(email: string) {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  logout() {
    return from(signOut(this.auth)).pipe(
      switchMap(() => {
        localStorage.removeItem('role');
        this.roleSub.next(null);
        return from(Promise.resolve());
      })
    );
  }

  getToken(): Observable<string | null> {
    if (this.auth.currentUser) {
      return from(getIdToken(this.auth.currentUser));
    }
    return from(Promise.resolve(null));
  }

  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }

  getUser(): User | null {
    return this.auth.currentUser;
  }

  // Check Auth State Async (for Guard)
  waitForAuth(): Observable<boolean> {
    return new Observable(observer => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      });
    });
  }

  isAdmin(): boolean {
    // Basic check from state. For strict route guard, use Async check.
    return this.roleSub.value === 1;
  }

  setRole(role: any) {
    const numRole = Number(role);
    this.roleSub.next(numRole);
    localStorage.setItem('role', String(numRole));
  }
}
