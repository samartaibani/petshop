import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private api: ApiService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;

      // 1. Register with Backend API (which creates Firebase user + Firestore doc)
      // Actually our backend flow: POST /auth/register { email, password, name } 
      // -> Backend creates Firebase User -> Backend creates Firestore Doc.

      this.api.registerBackend({ email, password, name }).subscribe({
        next: (res) => {
          // After successful registration, we can login immediately or ask user to login.
          // Let's ask to login.
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMsg = err.error.message || "Registration Failed";
        }
      });
    }
  }
}
