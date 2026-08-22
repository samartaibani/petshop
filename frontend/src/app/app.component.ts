import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { AdoptionModalService } from './services/adoption-modal.service';
import { map, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isAdmin$ = this.auth.role$.pipe(map(role => role === 1));
  isAuthPage$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      return url.includes('/login') || url.includes('/register');
    })
  );

  constructor(
    private auth: AuthService,
    private router: Router,
    public adoptionModalService: AdoptionModalService
  ) { }

  onAdoptionSuccess() {
    this.adoptionModalService.notifySuccess();
    this.adoptionModalService.closeForm();
  }
}
