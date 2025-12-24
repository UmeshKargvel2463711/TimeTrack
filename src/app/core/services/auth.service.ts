import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private router = inject(Router);
    private platformId = inject(PLATFORM_ID);

    // This Signal updates the name in your dashboard header instantly
    currentUser = signal<any>(null);

    constructor() {
        // Check if running in browser to avoid localStorage errors in Node/Vite
        if (isPlatformBrowser(this.platformId)) {
            const savedUser = localStorage.getItem('user_session');
            if (savedUser) {
                this.currentUser.set(JSON.parse(savedUser));
            }
        }
    }

    // FIX: Explicitly defined register method to resolve TS2339
    register(userData: any) {
        if (isPlatformBrowser(this.platformId)) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');

            // Add new user to the local storage 'database'
            users.push(userData);
            localStorage.setItem('users', JSON.stringify(users));

            // Auto-login: Set the signal so the Dashboard shows their name immediately
            this.currentUser.set(userData);
            localStorage.setItem('user_session', JSON.stringify(userData));

            // Navigate to dashboard after registration
            this.router.navigate(['/admin/dashboard']);
        }
    }

    login(email: string, password: string): boolean {
        if (isPlatformBrowser(this.platformId)) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const foundUser = users.find((u: any) => u.email === email && u.password === password);

            if (foundUser) {
                this.currentUser.set(foundUser);
                localStorage.setItem('user_session', JSON.stringify(foundUser));
                this.router.navigate(['/admin/dashboard']);
                return true;
            }
        }
        return false;
    }

    logout() {
        this.currentUser.set(null);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('user_session');
        }
        this.router.navigate(['/login']);
    }
}