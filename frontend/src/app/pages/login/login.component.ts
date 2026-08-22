import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private api: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  successMsg = '';

  onForgotPassword() {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      this.errorMsg = "Please enter your email first.";
      return;
    }

    this.auth.resetPassword(email).subscribe({
      next: () => {
        this.successMsg = "Check your email for instructions.";
        this.errorMsg = "";
      },
      error: (err) => {
        this.errorMsg = "Reset Failed: " + err.message;
        this.successMsg = "";
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.auth.login(email, password).subscribe({
        next: (userCred) => {
          // Get Token and Validate with Backend to get Role
          userCred.user.getIdToken().then(token => {
            this.api.loginBackend(token).subscribe({
              next: (res) => {
                this.auth.setRole(res.user.role);

                // Redirect based on role
                if (res.user.role === 1) {
                  this.router.navigate(['/admin/dashboard']);
                } else {
                  this.router.navigate(['/home']);
                }
              },
              error: (err) => {
                this.errorMsg = "Backend Login Failed";
              }
            });
          });
        },
        error: (err) => {
          this.errorMsg = "Invalid Credentials";
        }
      });
    }
  }
}
