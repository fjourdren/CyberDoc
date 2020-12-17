import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-settings-profile-page',
  templateUrl: './settings-profile-page.component.html',
  styleUrls: ['./settings-profile-page.component.css'],
})
export class SettingsProfilePageComponent {
  @ViewChild('treeviewDrawer') treeviewDrawer: MatDrawer;

  treeviewDrawerLocked = false;
  fileDetailDrawerLocked = false;
  smallScreen = false;
  loading = false;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver
      .observe('(max-width: 600px)')
      .subscribe((result) => {
        this.smallScreen = result.matches;
      });
    this.breakpointObserver
      .observe('(max-width: 800px)')
      .subscribe((result) => {
        this.fileDetailDrawerLocked = !result.matches;
      });
    this.breakpointObserver
      .observe('(max-width: 600px)')
      .subscribe((result) => {
        this.treeviewDrawerLocked = !result.matches;
      });
  }
}
