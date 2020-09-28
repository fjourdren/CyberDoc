import { BreakpointObserver } from '@angular/cdk/layout';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
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
  loading = false;

  currentDirectory: CloudDirectory;
  selectedNode: CloudNode;

  constructor(private breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute,
    private router: Router,
    private fsProvider: FileSystemProvider,
    private userServiceProvider: UserServiceProvider) {
    this.fsProvider.default().refreshNeeded().subscribe(()=>this.refresh());
    this.breakpointObserver.observe('(max-width: 1000px)').subscribe(result => {
      this.fileDetailDrawerLocked = !result.matches;
    })
    this.breakpointObserver.observe('(max-width: 1500px)').subscribe(result => {
      this.treeviewDrawerLocked = !result.matches;
    })
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.route.paramMap.subscribe((val) => {
        this.treeviewDrawer.close();
        let currentDirectoryID: string;
        if (val.has("dirID")) {
          currentDirectoryID = val.get("dirID");
        } else {
          currentDirectoryID = this.userServiceProvider.default().getActiveUser().rootDirectoryID;
        }
        this.refresh(currentDirectoryID);
      });
    }, 50)
  }

  refresh(directoryID: string | null = null){
    this.loading = true;
    this.fsProvider.default().get(directoryID || this.currentDirectory.id).toPromise().then(node => {
      if (node.isDirectory) {
        this.currentDirectory = node;
      } else {
        this.router.navigate(['/files']);
      }
      this.loading = false;
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
