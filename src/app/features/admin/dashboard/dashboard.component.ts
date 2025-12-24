import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent {
  private authService = inject(AuthService);

  // Header name binding
  userProfile = this.authService.currentUser;

  // Modal and List state
  isModalOpen = signal(false);
  usersList = signal([
    { name: 'John Smith', email: 'john.smith@company.com', role: 'Employee', department: 'Engineering', status: 'Active' }
  ]);

  // Temporary object for "Add User" details
  newUser = { name: '', email: '', role: 'Employee', department: '' };

  toggleModal() {
    this.isModalOpen.set(!this.isModalOpen());
    // Reset form when opening/closing
    this.newUser = { name: '', email: '', role: 'Employee', department: '' };
  }

  saveUser() {
    if (this.newUser.name && this.newUser.email) {
      this.usersList.update(users => [...users, { ...this.newUser, status: 'Active' }]);
      this.toggleModal();
    }
  }

  logout() { this.authService.logout(); }
}