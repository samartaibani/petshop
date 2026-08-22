import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-navbar',
    templateUrl: './admin-navbar.component.html',
    styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent {

    constructor(private auth: AuthService, private router: Router) { }

    logout() {
        this.auth.logout().subscribe(() => {
            this.router.navigate(['/login']);
        });
    }
}
