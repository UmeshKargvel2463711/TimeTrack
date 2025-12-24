// Import Angular core features and libraries
import { Component, OnInit, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Import Chart.js for productivity charts
import { Chart, registerables } from 'chart.js'

// Import custom authentication service
import { AuthService } from '../../../core/services/auth.service';
import { from } from 'rxjs';

// Register Chart.js components
Chart.register(...registerables);

// Interfaces define the shape of data objects
interface TimeLog { date: string; start: string; end: string; break: number; total: number; }
interface DetailedTask { id: number; title: string; status: 'Pending' | 'In Progress' | 'Completed'; currentHours: number; totalHours: number; progress: number; }
interface DetailedNotification { id: number; type: 'assignment' | 'deadline' | 'reminder'; message: string; timestamp: string; read: boolean; }

@Component({
  selector: 'app-employee-dashboard', // Component tag used in HTML
  standalone: true, // Standalone component (no need for NgModule)
  imports: [CommonModule, FormsModule], // Modules used inside template
  templateUrl: './dashboard.component.html', // HTML file linked
  styleUrls: ['./dashboard.component.css'] // CSS file linked
})
export class EmployeeDashboardComponent implements OnInit {
  // References to chart canvas elements in HTML
  @ViewChild('hoursChart') hoursChartCanvas!: ElementRef;
  @ViewChild('statusChart') statusChartCanvas!: ElementRef;

  // Signals (reactive state variables)
  activeTab = signal<string>('logging'); // Default tab is "logging"
  showModal = signal<boolean>(false); // Controls modal visibility

  // Sample time logs data
  timeLogs = signal<TimeLog[]>([
    { date: 'Sun, Dec 15', start: '09:00', end: '17:30', break: 60, total: 7.50 },
    { date: 'Sat, Dec 14', start: '09:00', end: '18:00', break: 60, total: 8.00 },
    { date: 'Fri, Dec 13', start: '09:15', end: '17:45', break: 45, total: 7.75 }
  ]);

  // Sample tasks data
  detailedTasks = signal<DetailedTask[]>([
    { id: 1, title: 'Implement User Authentication Module', status: 'In Progress', currentHours: 13.5, totalHours: 16, progress: 84 },
    { id: 2, title: 'Design Database Schema', status: 'Completed', currentHours: 5.5, totalHours: 8, progress: 68 },
    { id: 3, title: 'Code Review - Time Logging Module', status: 'Pending', currentHours: 0.0, totalHours: 4, progress: 0 }
  ]);

  // Sample notifications data
  detailedNotifications = signal<DetailedNotification[]>([
    { id: 1, type: 'assignment', message: 'New task assigned: Code Review - Time Logging Module', timestamp: 'Dec 15, 10:30 AM', read: false },
    { id: 2, type: 'deadline', message: 'Task "Implement User Authentication Module" is due in 2 days', timestamp: 'Dec 15, 9:00 AM', read: false },
    { id: 3, type: 'reminder', message: 'Remember to log your hours for yesterday', timestamp: 'Dec 14, 5:00 PM', read: true }
  ]);

  // Default new log entry (used in modal form)
  newLog = { date: '2025-12-22', start: '09:00', end: '17:45', break: 10 };

  // Computed values (auto-updated when signals change)
  weeklyHours = computed(() => Number(this.timeLogs().reduce((acc, log) => acc + log.total, 0).toFixed(2)));
  unreadCount = computed(() => this.detailedNotifications().filter(n => !n.read).length);

  // Calculate total working hours for new log entry
  totalGap = computed(() => {
    if (!this.newLog.start || !this.newLog.end) return 0;
    const start = new Date(`2025-01-01T${this.newLog.start}`);
    const end = new Date(`2025-01-01T${this.newLog.end}`);
    const diffHours = (end.getTime() - start.getTime()) / 3600000;
    const final = diffHours - (this.newLog.break / 60);
    return final > 0 ? Number(final.toFixed(2)) : 0;
  });

  // Constructor injects AuthService and Router
  constructor(public authService: AuthService, private router: Router) { }

  // Lifecycle hook: runs when component loads
  ngOnInit() {
    // Redirect to login if no user is logged in
    if (!this.authService.currentUser()) this.router.navigate(['/login']);
  }

  // Switch between tabs
  setTab(tab: string) {
    this.activeTab.set(tab);
    // Initialize charts when productivity tab is opened
    if (tab === 'productivity') setTimeout(() => this.initCharts(), 50);
  }

  // Save new time log entry
  saveLog() {
    const dateObj = new Date(this.newLog.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const entry: TimeLog = { ...this.newLog, date: formattedDate, total: this.totalGap() };
    this.timeLogs.update(prev => [entry, ...prev]); // Add new log at top
    this.showModal.set(false); // Close modal
  }

  // Initialize productivity charts
  initCharts() {
    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

    // Bar chart for daily hours
    new Chart(this.hoursChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Dec 13', 'Dec 14', 'Dec 15'],
        datasets: [{ data: [7.75, 8.0, 7.5], backgroundColor: '#5a67d8', borderRadius: 6 }]
      },
      options: chartOptions
    });

    // Pie chart for task status distribution
    new Chart(this.statusChartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{ data: [33, 33, 33], backgroundColor: ['#48bb78', '#5a67d8', '#cbd5e0'] }]
      },
      options: chartOptions
    });
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.detailedNotifications.update(notes => notes.map(n => ({ ...n, read: true })));
  }

  // Logout user
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
