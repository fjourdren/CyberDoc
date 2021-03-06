import { BreakpointObserver } from '@angular/cdk/layout';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, NgZone, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { TwoFactorGenerateRecoveryCodesDialogComponent } from 'src/app/components/two-factor/two-factor-generate-recovery-codes-dialog/two-factor-generate-recovery-codes-dialog.component';
import {
  CloudDirectory,
  CloudNode,
  isValidSearchParams,
  SearchParams,
} from 'src/app/models/files-api-models';
import { FileSystemService } from 'src/app/services/filesystems/file-system.service';
import { UsersService } from 'src/app/services/users/users.service';
import { environment } from 'src/environments/environment';
import {
  FilesUtilsService,
  FileType,
} from '../../services/files-utils/files-utils.service';
import { FilesConvertToEtherpadDialogComponent } from '../../components/files/files-convert-to-etherpad-dialog/files-convert-to-etherpad-dialog.component';
import { FilesPurgeDialogComponent } from '../../components/files/files-purge-dialog/files-purge-dialog.component';

@Component({
  selector: 'app-files-page',
  templateUrl: './files-page.component.html',
  styleUrls: ['./files-page.component.scss'],
})
export class FilesPageComponent implements AfterViewInit {
  @ViewChild('treeviewDrawer') treeviewDrawer: MatDrawer;

  treeviewDrawerLocked = false;
  fileDetailDrawerLocked = false;
  smallScreen = false;
  loading = false;
  searchMode = false;
  sharedWithMeMode = false;
  currentlyUploading = false;
  binMode = false;

  currentDirectory: CloudDirectory;
  selectedNode: CloudNode;
  routeSearchParams: SearchParams;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    private fsService: FileSystemService,
    private usersService: UsersService,
    private filesUtils: FilesUtilsService,
  ) {
    fsService.getCurrentFileUpload().subscribe((val) => {
      this.currentlyUploading = val != undefined;
    });

    this.fsService.refreshNeeded().subscribe(() => this.refresh());
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
      .observe('(max-width: 1200px)')
      .subscribe((result) => {
        this.treeviewDrawerLocked = !result.matches;
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.ngZone.run(() => {
        this.route.paramMap.subscribe((paramMap) => {
          if (!this.treeviewDrawerLocked) {
            this.treeviewDrawer.close();
          }
          switch (true) {
            //files-search
            case this.route.toString().indexOf('files-search') !== -1: {
              if (paramMap.has('searchParams')) {
                this.searchMode = true;
                this.sharedWithMeMode = false;
                this.routeSearchParams = JSON.parse(
                  paramMap.get('searchParams'),
                );
                if (
                  isValidSearchParams(
                    this.routeSearchParams,
                    this.usersService
                      .getActiveUser()
                      .tags.map((tag) => tag._id),
                  )
                ) {
                  this.refresh();
                } else {
                  this.redirectToDefaultPage();
                }
              } else {
                this.redirectToDefaultPage();
              }
              break;
            }

            //files
            case this.route.toString().indexOf('files') !== -1: {
              if (paramMap.has('dirID')) {
                this.sharedWithMeMode = false;
                this.binMode = false;
                this.searchMode = false;
                this.routeSearchParams = null;
                this.refresh(paramMap.get('dirID'));
              } else {
                this.redirectToDefaultPage();
              }
              break;
            }

            // Shared-with-me
            case this.route.toString().indexOf('shared-with-me') !== -1: {
              this.sharedWithMeMode = true;
              this.binMode = false;
              this.searchMode = false;
              this.routeSearchParams = null;
              this.refresh();
              break;
            }

            // bin
            case this.route.toString().indexOf('bin') !== -1: {
              this.sharedWithMeMode = false;
              this.binMode = true;
              this.searchMode = false;
              this.routeSearchParams = null;
              this.refresh();
              break;
            }

            // generateRecoveryCodes
            case this.route.toString().indexOf('generateRecoveryCodes') !==
              -1: {
              this.dialog.open(TwoFactorGenerateRecoveryCodesDialogComponent, {
                maxWidth: '500px',
                disableClose: true,
              });
              this.redirectToDefaultPage();
              this.refresh();
              break;
            }
          }
        });
      });
    }, 50);
  }

  refresh(directoryID: string | null = null) {
    this.loading = true;
    const oldSelectedNodeID = this.selectedNode ? this.selectedNode._id : null;
    let promise: Promise<CloudNode>;

    if (this.searchMode) {
      promise = this.fsService.search(this.routeSearchParams).toPromise();
    } else if (this.sharedWithMeMode) {
      promise = this.fsService.getSharedFiles().toPromise();
    } else if (this.binMode) {
      promise = this.fsService.getBinFiles().toPromise();
    } else {
      if (!directoryID && !this.currentDirectory) return; //FIXME
      const id =
        directoryID ||
        this.currentDirectory._id ||
        this.usersService.getActiveUser().directory_id;
      promise = this.fsService.get(id).toPromise();
    }

    this.selectedNode = null;
    this.currentDirectory = null;
    promise
      .then((node) => {
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
          this.redirectToDefaultPage();
        }
      })
      .catch((err) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.redirectToDefaultPage();
        } else {
          throw err;
        }
      });
  }

  openButtonClicked(node: CloudNode) {
    if (this.binMode) return;

    if (node.isDirectory) {
      this.router.navigate(['/files', node._id]);
    } else if (
      this.filesUtils.getFileTypeForMimetype(node.mimetype) ===
      FileType.EtherPad
    ) {
      location.replace(`${environment.etherpadBaseUrl}/p/${node._id}`);
    } else if (
      this.filesUtils.canBeOpenedInApp(
        this.filesUtils.getFileTypeForMimetype(node.mimetype),
      )
    ) {
      this.dialog
        .open(FilesConvertToEtherpadDialogComponent, {
          data: node,
        })
        .afterClosed()
        .toPromise()
        .then((result) => {
          if (result) {
            location.replace(`${environment.etherpadBaseUrl}/p/${node._id}`);
          }
        });
    }
  }

  redirectToDefaultPage() {
    if (this.usersService.getActiveUser().role === 'owner') {
      this.router.navigate([
        '/files',
        this.usersService.getActiveUser().directory_id,
      ]);
    } else {
      this.router.navigate(['/shared-with-me']);
    }
  }

  purgeBin() {
    this.dialog.open(FilesPurgeDialogComponent, {
      maxWidth: '400px',
    });
  }
}
