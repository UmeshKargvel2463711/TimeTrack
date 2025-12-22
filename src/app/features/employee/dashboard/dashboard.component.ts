import { Component, OnInit, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js'
import { AuthService } from '../../../core/services/auth.service';
import { from } from 'rxjs';

Chart.register(...registerables);

interface TimeLog { date: string; start: string; end: string; break: number; total: number; }
interface DetailedTask { id: number; title: string; status: 'Pending' | 'In Progress' | 'Completed'; currentHours: number; totalHours: number; progress: number; }
interface DetailedNotification { id: number; type: 'assignment' | 'deadline' | 'reminder'; message: string; timestamp: string; read: boolean; }

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  @ViewChild('hoursChart') hoursChartCanvas!: ElementRef;
  @ViewChild('statusChart') statusChartCanvas!: ElementRef;

  activeTab = signal<string>('logging');
  showModal = signal<boolean>(false);

  timeLogs = signal<TimeLog[]>([
    { date: 'Sun, Dec 15', start: '09:00', end: '17:30', break: 60, total: 7.50 },
    { date: 'Sat, Dec 14', start: '09:00', end: '18:00', break: 60, total: 8.00 },
    { date: 'Fri, Dec 13', start: '09:15', end: '17:45', break: 45, total: 7.75 }
  ]);

  detailedTasks = signal<DetailedTask[]>([
    { id: 1, title: 'Implement User Authentication Module', status: 'In Progress', currentHours: 13.5, totalHours: 16, progress: 84 },
    { id: 2, title: 'Design Database Schema', status: 'Completed', currentHours: 5.5, totalHours: 8, progress: 68 },
    { id: 3, title: 'Code Review - Time Logging Module', status: 'Pending', currentHours: 0.0, totalHours: 4, progress: 0 }
  ]);

  detailedNotifications = signal<DetailedNotification[]>([
    { id: 1, type: 'assignment', message: 'New task assigned: Code Review - Time Logging Module', timestamp: 'Dec 15, 10:30 AM', read: false },
    { id: 2, type: 'deadline', message: 'Task "Implement User Authentication Module" is due in 2 days', timestamp: 'Dec 15, 9:00 AM', read: false },
    { id: 3, type: 'reminder', message: 'Remember to log your hours for yesterday', timestamp: 'Dec 14, 5:00 PM', read: true }
  ]);

  newLog = { date: '2025-12-22', start: '09:00', end: '17:45', break: 10 };

  weeklyHours = computed(() => Number(this.timeLogs().reduce((acc, log) => acc + log.total, 0).toFixed(2)));
  unreadCount = computed(() => this.detailedNotifications().filter(n => !n.read).length);

  totalGap = computed(() => {
    if (!this.newLog.start || !this.newLog.end) return 0;
    const start = new Date(`2025-01-01T${this.newLog.start}`);
    const end = new Date(`2025-01-01T${this.newLog.end}`);
    const diffHours = (end.getTime() - start.getTime()) / 3600000;
    const final = diffHours - (this.newLog.break / 60);
    return final > 0 ? Number(final.toFixed(2)) : 0;
  });

  constructor(public authService: AuthService, private router: Router) { }

  ngOnInit() {
    if (!this.authService.currentUser()) this.router.navigate(['/login']);
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
    if (tab === 'productivity') setTimeout(() => this.initCharts(), 50);
  }

  saveLog() {
    const dateObj = new Date(this.newLog.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const entry: TimeLog = { ...this.newLog, date: formattedDate, total: this.totalGap() };
    this.timeLogs.update(prev => [entry, ...prev]);
    this.showModal.set(false);
  }

  initCharts() {
    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
    new Chart(this.hoursChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Dec 13', 'Dec 14', 'Dec 15'],
        datasets: [{ data: [7.75, 8.0, 7.5], backgroundColor: '#5a67d8', borderRadius: 6 }]
      },
      options: chartOptions
    });
    new Chart(this.statusChartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{ data: [33, 33, 33], backgroundColor: ['#48bb78', '#5a67d8', '#cbd5e0'] }]
      },
      options: chartOptions
    });
  }

  markAllAsRead() {
    this.detailedNotifications.update(notes => notes.map(n => ({ ...n, read: true })));
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}