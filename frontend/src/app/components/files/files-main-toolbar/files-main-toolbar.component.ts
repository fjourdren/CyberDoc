import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EMPTY_SEARCH_PARAMS, SearchParams } from 'src/app/models/files-api-models';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { FilesFilterDialogComponent } from '../files-filter-dialog/files-filter-dialog.component';

@Component({
  selector: 'app-files-main-toolbar',
  templateUrl: './files-main-toolbar.component.html',
  styleUrls: ['./files-main-toolbar.component.scss']
})
export class FilesMainToolbarComponent {

  @Input() hideMenuButton: boolean;
  @Input() hideAppName: boolean;
  private _routeSearchParams: SearchParams;
  @Output() menuButtonClicked = new EventEmitter<void>();

  searchInput = "";

  constructor(private userServiceProvider: UserServiceProvider,
    private dialog: MatDialog,
    private router: Router) { }

  get routeSearchParams() {
    return this._routeSearchParams;
  }

  @Input()
  set routeSearchParams(val: SearchParams) {
    this._routeSearchParams = val;
    this.searchInput = val ? val.name : "";
  }

  getCurrentUsername() {
    const user = this.userServiceProvider.default().getActiveUser();
    return `${user.firstname} ${user.lastname}`;
  }

  onSearchInputChange(e: Event) {
    if (!this.routeSearchParams) {
      this.routeSearchParams = EMPTY_SEARCH_PARAMS;
    }
    this.routeSearchParams.name = this.searchInput;
    this.router.navigate(["/files-search", JSON.stringify(this.routeSearchParams)]);
  }

  openFilterDialog() {
    this.dialog.open(FilesFilterDialogComponent, {
      maxWidth: "400px",
      data: this.routeSearchParams
    }).afterClosed().toPromise().then((searchParams: any) => {
      if (searchParams) {
        this.router.navigate(["/files-search", JSON.stringify(searchParams)]);
      }
    })
  }

}
