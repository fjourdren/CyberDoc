import { AfterViewInit, Component } from '@angular/core';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';

@Component({
  selector: 'app-logout-page',
  templateUrl: './logout-page.component.html',
  styleUrls: ['./logout-page.component.css']
})
export class LogoutPageComponent implements AfterViewInit {

  constructor(private userServiceProvider: UserServiceProvider) { }

  ngAfterViewInit(): void {
    this.userServiceProvider.default().logout().toPromise().then(()=>{
      location.pathname = "/login";
    })
  }


}
