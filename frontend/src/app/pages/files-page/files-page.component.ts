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
        this.route.paramMap.subscribe((val) => {
          if (!this.treeviewDrawerLocked) { this.treeviewDrawer.close() };

          if (this.route.toString().indexOf("files-search") !== -1) {
            this.searchMode = true;
            this.routeSearchParams = JSON.parse(val.get("searchParams"));
            if (!isValidSearchParams(this.routeSearchParams, this.userServiceProvider.default().getActiveUser().fileTags.map(tag => tag.id))) {
              this.router.navigate(['/files']);
              return;
            }
            /**/

            this.loading = true;
            this.currentDirectory = null;
            this.selectedNode = null;
            this.fsProvider.default().search(this.routeSearchParams).toPromise().then(node => {
              this.currentDirectory = node;
              this.loading = false;
            }).catch(err => {
              if (err instanceof HttpErrorResponse && err.status === 404) {
                this.router.navigate(['/files']);
              } else {
                throw err;
              }
            });


            /**/


          } else {
            this.searchMode = false;
            this.selectedNode = null;
            let currentDirectoryID: string;
            if (val.has("dirID")) {
              currentDirectoryID = val.get("dirID");
              this.refresh(currentDirectoryID);
            } else {
              this.router.navigate(['/files', this.userServiceProvider.default().getActiveUser().directory_id]);
            }
          }
        });

      })
    }, 50)
  }

  refresh(directoryID: string | null = null) {
    if (!this.currentDirectory && !directoryID) return; //FIXME

    this.loading = true;
    const id = directoryID || this.currentDirectory.id;
    const selectedNodeID = this.selectedNode ? this.selectedNode.id : null;

    this.currentDirectory = null;
    this.selectedNode = null;
    this.fsProvider.default().get(id).toPromise().then(node => {
      if (node.isDirectory) {
        this.currentDirectory = node;
        if (selectedNodeID) {
          for (const item of node.directoryContent) {
            if (item.id === selectedNodeID) {
              this.selectedNode = item;
            }
          }
        }

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
