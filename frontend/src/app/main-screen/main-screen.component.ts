import { BreakpointObserver } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrls: ['./main-screen.component.scss']
})
export class MainScreenComponent {

  treeviewDrawerLocked = false;
  fileDetailDrawerLocked = false;
  private _currentDirectoryID: string;
  private _selectedNodeID: string;

  constructor(private breakpointObserver: BreakpointObserver, private route: ActivatedRoute) {
    this.breakpointObserver.observe('(max-width: 1000px)').subscribe(result => {
      this.fileDetailDrawerLocked = !result.matches;
    })
    this.breakpointObserver.observe('(max-width: 1500px)').subscribe(result => {
      this.treeviewDrawerLocked = !result.matches;
    })

    route.paramMap.subscribe((val) => {
      if (val.has("dirID")) {
        this.currentDirectoryID = val.get("dirID");
      }
    });
  }

  get currentDirectoryID() {
    return this._currentDirectoryID;
  }

  set currentDirectoryID(directoryID: string) {
    this._currentDirectoryID = directoryID;
    if (directoryID) {
      history.pushState({}, null, `/drive/${directoryID}`);
    }
  }

  get selectedNodeID() {
    return this._selectedNodeID;
  }

  set selectedNodeID(nodeID: string) {
    this._selectedNodeID = nodeID;
  }
}
