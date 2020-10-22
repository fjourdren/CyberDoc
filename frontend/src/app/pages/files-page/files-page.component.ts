import { BreakpointObserver } from '@angular/cdk/layout';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, NgZone, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { CloudDirectory, CloudNode, isValidSearchParams, SearchParams } from 'src/app/models/files-api-models';
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
  searchMode = false;

  currentDirectory: CloudDirectory;
  selectedNode: CloudNode;
  routeSearchParams: SearchParams;

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

        this.route.paramMap.subscribe(paramMap => {
          if (!this.treeviewDrawerLocked) { this.treeviewDrawer.close() };
          switch (true) {

            //files-search
            case this.route.toString().indexOf("files-search") !== -1: {
              if (paramMap.has("searchParams")) {
                this.searchMode = true;
                this.routeSearchParams = JSON.parse(paramMap.get("searchParams"));
                if (isValidSearchParams(this.routeSearchParams, this.userServiceProvider.default().getActiveUser().tags.map(tag => tag._id))) {
                  this.refresh();
                }else{
                  this.router.navigate(['/files', this.userServiceProvider.default().getActiveUser().directory_id]);
                }
              } else {
                this.router.navigate(['/files', this.userServiceProvider.default().getActiveUser().directory_id]);
              }
              break;
            }

            //files
            case this.route.toString().indexOf("files") !== -1: {
              if (paramMap.has("dirID")) {
                this.searchMode = false;
                this.routeSearchParams = null;
                this.refresh(paramMap.get("dirID"));
              } else {
                this.router.navigate(['/files', this.userServiceProvider.default().getActiveUser().directory_id]);
              }

              break;
            }
          }
        })
      })
    }, 50)
  }

  refresh(directoryID: string | null = null) {
    this.loading = true;
    const oldSelectedNodeID = this.selectedNode ? this.selectedNode._id : null;
    let promise: Promise<CloudNode>;

    if (this.searchMode) {
      promise = this.fsProvider.default().search(this.routeSearchParams).toPromise();
    } else {
      const id = directoryID || this.currentDirectory._id || this.userServiceProvider.default().getActiveUser().directory_id;
      promise = this.fsProvider.default().get(id).toPromise();
    }

    this.selectedNode = null;
    this.currentDirectory = null;
    promise.then(node => {
      this.loading = false;
      if (node.isDirectory) {
        this.currentDirectory = node;
        if (oldSelectedNodeID) {
          for (const item of node.directoryContent) {
            if (item._id === oldSelectedNodeID) {
              this.selectedNode = item;
            }
          }
        }
      } else {
        this.router.navigate(['/files', this.userServiceProvider.default().getActiveUser().directory_id]);
      }
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
      this.router.navigate(['/files', node._id]);
    } else {
      this.router.navigate(['/file', node._id]);
    }
  }
}
