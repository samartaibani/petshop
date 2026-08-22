import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.api.getAllUsers().subscribe(res => this.users = res);
  }

  deleteUser(id: string) {
    if (confirm('Delete this user?')) {
      this.api.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(u => u.uid !== id);
      });
    }
  }
}
