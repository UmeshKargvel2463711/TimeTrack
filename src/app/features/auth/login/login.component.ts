import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    isLoginMode = true;
    selectedRole = 'Employee';
    error = '';

    authData = {
        name: '',
        email: '',
        password: '',
        role: '',
        adminId: '',
        employeeId: '',
        department: ''
    };

    private route = inject(ActivatedRoute);
    private authService = inject(AuthService);
    private router = inject(Router);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['role']) {
                this.selectedRole = params['role'];
                this.authData.role = params['role'];
            }
        });
    }

    toggleMode() {
        this.isLoginMode = !this.isLoginMode;
        this.error = '';
    }

    onAuthSubmit() {
        if (this.isLoginMode) {
            const success = this.authService.login(this.authData.email, this.authData.password);
            if (success) {
                this.navigateByUserRole();
            } else {
                this.error = 'Invalid credentials. Please register first.';
            }
        } else {
            this.authService.register({ ...this.authData });
            alert(`${this.selectedRole} registered! Please login now.`);
            this.isLoginMode = true;
            this.error = '';
        }
    }
    onSubmit() {
        if (this.isLoginMode) {
            const success = this.authService.login(this.authData.email, this.authData.password);
            if (!success) {
                alert('Invalid credentials');
            }
        } else {
            // This call will now work because 'register' exists in the service
            this.authService.register({ ...this.authData });
        }
    }

    private navigateByUserRole() {
        const user = this.authService.currentUser();
        if (user?.role === 'Admin') {
            this.router.navigate(['/admin/dashboard']);
        } else if (user?.role === 'Manager') {
            this.router.navigate(['/manager/dashboard']);
        } else if (user?.role === 'Employee') {
            this.router.navigate(['/employee/dashboard']);
        }
    }
}