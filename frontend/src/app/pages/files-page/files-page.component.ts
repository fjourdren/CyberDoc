import { BreakpointObserver } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';

@Component({
  selector: 'app-files-page',
  templateUrl: './files-page.component.html',
  styleUrls: ['./files-page.component.scss']
})
export class FilesPageComponent {

  treeviewDrawerLocked = false;
  fileDetailDrawerLocked = false;
  private _currentDirectoryID: string;
  private _selectedNodeID: string;

  constructor(private breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute,
    private userServiceProvider: UserServiceProvider) {
    this.breakpointObserver.observe('(max-width: 1000px)').subscribe(result => {
      this.fileDetailDrawerLocked = !result.matches;
    })
    this.breakpointObserver.observe('(max-width: 1500px)').subscribe(result => {
      this.treeviewDrawerLocked = !result.matches;
    })


    route.paramMap.subscribe((val) => {
      if (val.has("dirID")) {
        this.currentDirectoryID = val.get("dirID");
      } else {
        this.currentDirectoryID = userServiceProvider.default().getActiveUser().rootDirectoryID;
      }
    });
  }

  get currentDirectoryID() {
    return this._currentDirectoryID;
  }

  set currentDirectoryID(directoryID: string) {
    this._currentDirectoryID = directoryID;
    if (directoryID) {
      history.pushState({}, null, `/files/${directoryID}`);
    }
  }

  get selectedNodeID() {
    return this._selectedNodeID;
  }

  set selectedNodeID(nodeID: string) {
    this._selectedNodeID = nodeID;
  }
}
