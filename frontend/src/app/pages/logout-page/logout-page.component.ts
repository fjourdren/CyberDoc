import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-logout-page',
  templateUrl: './logout-page.component.html',
  styleUrls: ['./logout-page.component.css'],
})
export class LogoutPageComponent implements AfterViewInit {
  constructor(private usersService: UsersService, private router: Router) {}

  ngAfterViewInit(): void {
    this.usersService
      .logout()
      .toPromise()
      .then(() => {
        this.router.navigate(['/login']);
      });
  }
}
