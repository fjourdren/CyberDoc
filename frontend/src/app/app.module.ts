import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button'
import { MatTreeModule } from '@angular/material/tree';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgResizeObserverPonyfillModule } from 'ng-resize-observer';
import { LayoutModule } from '@angular/cdk/layout';
import { NgxFilesizeModule } from 'ngx-filesize';

import { FilesDirectoryTableComponent } from './components/files/files-directory-table/files-directory-table.component';
import { FilesDetailsPanelComponent } from './components/files/files-details-panel/files-details-panel.component';
import { FilesTreeviewComponent } from './components/files/files-treeview/files-treeview.component';
import { FilesMainToolbarComponent } from './components/files/files-main-toolbar/files-main-toolbar.component';
import { FilesUploadProgressSnackbarComponent } from './components/files/files-upload-progress-snackbar/files-upload-progress-snackbar.component';
import { FilesBreadcrumbComponent } from './components/files/files-breadcrumb/files-breadcrumb.component';
import { FilesMoveCopyDialogComponent } from './components/files/files-move-copy-dialog/files-move-copy-dialog.component';
import { FilesRenameDialogComponent } from './components/files/files-rename-dialog/files-rename-dialog.component';
import { FilesDeleteDialogComponent } from './components/files/files-delete-dialog/files-delete-dialog.component';
import { FilesNewFolderDialogComponent } from './components/files/files-new-folder-dialog/files-new-folder-dialog.component';
import { FilesUploadComponent } from './components/files/files-upload/files-upload.component';
import { FilesGenericTableComponent } from './components/files/files-generic-table/files-generic-table.component';
import { FilesGenericTableBottomsheetComponent } from './components/files/files-generic-table-bottomsheet/files-generic-table-bottomsheet.component';

import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { FilesPageComponent } from './pages/files-page/files-page.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RemainingTimePipe } from './pipes/remaining-time/remaining-time.pipe';
import { GlobalErrorHandler } from './global-error-handler';
import { environment } from '../environments/environment';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

const FILES_COMPONENTS = [
  FilesDirectoryTableComponent,
  FilesDetailsPanelComponent,
  FilesTreeviewComponent,
  FilesMainToolbarComponent,
  FilesUploadProgressSnackbarComponent,
  FilesBreadcrumbComponent,
  FilesMoveCopyDialogComponent,
  FilesRenameDialogComponent,
  FilesDeleteDialogComponent,
  FilesNewFolderDialogComponent,
  FilesUploadComponent,
  FilesGenericTableComponent,
  FilesGenericTableBottomsheetComponent
]

@NgModule({
  declarations: [
    AppComponent,
    ...FILES_COMPONENTS,
    RemainingTimePipe,
    FilesPageComponent,
    NotFoundPageComponent,
    ErrorPageComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSortModule,
    MatTableModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatTreeModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatInputModule,
    MatCardModule,
    MatProgressBarModule,
    MatListModule,
    MatFormFieldModule,
    MatMenuModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    NgxFilesizeModule,
    NgResizeObserverPonyfillModule,
    LayoutModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [{ provide: ErrorHandler, useClass: GlobalErrorHandler }],
  bootstrap: [AppComponent]
})
export class AppModule { }
