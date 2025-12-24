import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
// Ensure this path leads to the actual .ts file
import { AdminDashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
    // ... other routes
    {
        path: 'admin/dashboard',
        component: AdminDashboardComponent, // This now works because of the 'export'
        canActivate: [adminGuard]
    }
];