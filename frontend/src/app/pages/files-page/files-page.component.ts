import { BreakpointObserver } from '@angular/cdk/layout';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, NgZone, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { CloudDirectory, CloudNode } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';

@Component({
  selector: 'app-files-page',
  templateUrl: './files-page.component.html',
  styleUrls: ['./files-page.component.scss']
})
export class FilesPageComponent implements AfterViewInit {

  @ViewChild("treeviewDrawer") treeviewDrawer: MatDrawer;

  treeviewDrawerLocked = false;
  fileDetailDrawerLocked = false;
  smallScreen = false;
  loading = false;

  currentDirectory: CloudDirectory;
  selectedNode: CloudNode;

  constructor(private breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    private fsProvider: FileSystemProvider,
    private userServiceProvider: UserServiceProvider) {
    this.fsProvider.default().refreshNeeded().subscribe(() => this.refresh());
    this.breakpointObserver.observe('(max-width: 600px)').subscribe(result => {
      this.smallScreen = result.matches;
    })
    this.breakpointObserver.observe('(max-width: 800px)').subscribe(result => {
      this.fileDetailDrawerLocked = !result.matches;
    })
    this.breakpointObserver.observe('(max-width: 1200px)').subscribe(result => {
      this.treeviewDrawerLocked = !result.matches;
    })
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.ngZone.run(() => {
        this.route.paramMap.subscribe((val) => {
          if (!this.treeviewDrawerLocked) { this.treeviewDrawer.close() };
          this.selectedNode = null;
          let currentDirectoryID: string;
          if (val.has("dirID")) {
            currentDirectoryID = val.get("dirID");
          } else {
            currentDirectoryID = this.userServiceProvider.default().getActiveUser().rootDirectoryID;
          }
          this.refresh(currentDirectoryID);
        });

      })
    }, 50)
  }

  refresh(directoryID: string | null = null) {
    this.loading = true;
    this.fsProvider.default().get(directoryID || this.currentDirectory.id).toPromise().then(node => {
      if (node.isDirectory) {
        this.currentDirectory = node;
      } else {
        this.router.navigate(['/files']);
      }
      this.loading = false;
    }).catch(err => {
      if (err instanceof HttpErrorResponse && err.status === 404) {
        this.router.navigate(['/files']);
      } else {
        throw err;
      }
    });
  }

  openButtonClicked(node: CloudNode) {
    if (node.isDirectory) {
      this.router.navigate(['/files', node.id]);
    } else {
      this.router.navigate(['/file', node.id]);
    }
  }
}
