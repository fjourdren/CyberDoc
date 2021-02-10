import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgResizeObserverPonyfillModule } from 'ng-resize-observer';
import { LayoutModule } from '@angular/cdk/layout';
import { NgxFilesizeModule } from 'ngx-filesize';
import { ClipboardModule } from 'ngx-clipboard';

import { FilesDetailsPanelComponent } from './components/files/files-details-panel/files-details-panel.component';
import { FilesTreeviewComponent } from './components/files/files-treeview/files-treeview.component';
import { FilesMainToolbarComponent } from './components/files/files-main-toolbar/files-main-toolbar.component';
import { FilesUploadProgressSnackbarComponent } from './components/files/files-upload-progress-snackbar/files-upload-progress-snackbar.component';
import { FilesBreadcrumbComponent } from './components/files/files-breadcrumb/files-breadcrumb.component';
import { FilesMoveCopyDialogComponent } from './components/files/files-move-copy-dialog/files-move-copy-dialog.component';
import { FilesRenameDialogComponent } from './components/files/files-rename-dialog/files-rename-dialog.component';
import { FilesDeleteDialogComponent } from './components/files/files-delete-dialog/files-delete-dialog.component';
import { FilesPurgeDialogComponent } from './components/files/files-purge-dialog/files-purge-dialog.component';
import { FilesRestoreDialogComponent } from './components/files/files-restore-dialog/files-restore-dialog.component';
import { FilesNewFolderDialogComponent } from './components/files/files-new-folder-dialog/files-new-folder-dialog.component';
import { FilesUploadDragZoneComponent } from './components/files/files-upload-drag-zone/files-upload-drag-zone.component';
import { FilesGenericTableComponent } from './components/files/files-generic-table/files-generic-table.component';
import { FilesGenericTableBottomsheetComponent } from './components/files/files-generic-table-bottomsheet/files-generic-table-bottomsheet.component';

import { SettingsMenuComponent } from './components/settings/settings-menu/settings-menu.component';
import { SettingsProfileComponent } from './components/settings/settings-profile/settings-profile.component';
import { SettingsSecurityComponent } from './components/settings/settings-security/settings-security.component';

import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { LogoutPageComponent } from './pages/logout-page/logout-page.component';
import { SettingsProfilePageComponent } from './pages/settings-profile-page/settings-profile-page.component';
import { SettingsSecurityPageComponent } from './pages/settings-security-page/settings-security-page.component';
import { FilesPageComponent } from './pages/files-page/files-page.component';

import { UnhandledErrorDialogComponent } from './components/global/unhandled-error-dialog/unhandled-error-dialog.component';

import { FileSystemService } from './services/filesystems/file-system.service';
import { FilesUtilsService } from './services/files-utils/files-utils.service';
import { UsersService } from './services/users/users.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RemainingTimePipe } from './pipes/remaining-time/remaining-time.pipe';
import { GlobalErrorHandler } from './global-error-handler';
import { FilesTagsInputComponent } from './components/files/files-tags-input/files-tags-input.component';
import { FilesFilterDialogComponent } from './components/files/files-filter-dialog/files-filter-dialog.component';
import { FilesFilterToolbarComponent } from './components/files/files-filter-toolbar/files-filter-toolbar.component';
import { SettingsMainToolbarComponent } from './components/settings/settings-main-toolbar/settings-main-toolbar.component';
import { FilesShareMenuDialogComponent } from './components/files/files-share-menu-dialog/files-share-menu-dialog.component';
import { PasswordRecoveryPageComponent } from './pages/password-recovery-page/password-recovery-page.component';
import { TwoFactorLoginPageComponent } from './pages/two-factor-login-page/two-factor-login-page.component';
import { SettingsDeleteTagDialogComponent } from './components/settings/settings-delete-tag-dialog/settings-delete-tag-dialog.component';
import { SettingsCreateEditTagDialogComponent } from './components/settings/settings-create-edit-tag-dialog/settings-create-edit-tag-dialog.component';
import { SecurityCheckDialogComponent } from './components/security-check-dialog/security-check-dialog.component';
import { TwoFactorCheckDialogComponent } from './components/two-factor/two-factor-check-dialog/two-factor-check-dialog.component';
import { TwoFactorEditDialogComponent } from './components/two-factor/two-factor-edit-dialog/two-factor-edit-dialog.component';
import { TwoFactorEditComponent } from './components/two-factor/two-factor-edit/two-factor-edit.component';
import {
  FilesSignConfirmDialogComponent,
  FilesSignDialogComponent,
} from './components/files/files-sign-dialog/files-sign-dialog.component';
import { TwoFactorGenerateRecoveryCodesDialogComponent } from './components/two-factor/two-factor-generate-recovery-codes-dialog/two-factor-generate-recovery-codes-dialog.component';
import { TwoFactorUseRecoveryCodeDialogComponent } from './components/two-factor/two-factor-use-recovery-code-dialog/two-factor-use-recovery-code-dialog.component';
import { FilesConvertToEtherpadDialogComponent } from './components/files/files-convert-to-etherpad-dialog/files-convert-to-etherpad-dialog.component';
import { TwoFactorService } from './services/twofactor/twofactor.service';
import { SettingsAskCurrentPasswordDialogComponent } from './components/settings/settings-ask-current-password-dialog/settings-ask-current-password-dialog.component';
import { LoadingDialogComponent } from './components/global/loading-dialog/loading-dialog.component';
import { FilePreviewPageComponent } from './pages/file-preview-page/file-preview-page.component';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { SetupBillingPageComponent } from './pages/setup-billing-page/setup-billing-page.component';
import { FilesSpaceInfoComponent } from './components/files/files-space-info/files-space-info.component';
import { SettingsBillingCardComponent } from './components/settings/settings-billing-card/settings-billing-card.component';
import { FilesNoEnoughStorageDialogComponent } from './components/files/files-no-enough-storage-dialog/files-no-enough-storage-dialog.component';
import { FilesNewMenuComponent } from './components/files/files-new-menu/files-new-menu.component';
import { SettingsSessionCardComponent } from './components/settings/settings-session-card/settings-session-card.component';
import { HttpErrorInterceptor } from './services/http-error.interceptor';

// AoT requires an exported function for factories
export const HttpLoaderFactory = (httpClient: HttpClient) =>
  new TranslateHttpLoader(httpClient);

const FILES_COMPONENTS = [
  FilesDetailsPanelComponent,
  FilesTreeviewComponent,
  FilesMainToolbarComponent,
  FilesUploadProgressSnackbarComponent,
  FilesBreadcrumbComponent,
  FilesMoveCopyDialogComponent,
  FilesRenameDialogComponent,
  FilesDeleteDialogComponent,
  FilesPurgeDialogComponent,
  FilesRestoreDialogComponent,
  FilesNewFolderDialogComponent,
  FilesUploadDragZoneComponent,
  FilesGenericTableComponent,
  FilesGenericTableBottomsheetComponent,
  FilesTagsInputComponent,
  FilesFilterDialogComponent,
];

const SETTINGS_COMPONENTS = [
  SettingsMenuComponent,
  SettingsProfileComponent,
  SettingsSecurityComponent,
  SettingsMainToolbarComponent,
];

@NgModule({
  declarations: [
    AppComponent,
    ...FILES_COMPONENTS,
    RemainingTimePipe,
    FilesPageComponent,
    NotFoundPageComponent,
    RegisterPageComponent,
    LoginPageComponent,
    LogoutPageComponent,
    ...SETTINGS_COMPONENTS,
    SettingsProfilePageComponent,
    SettingsSecurityPageComponent,
    UnhandledErrorDialogComponent,
    FilesFilterToolbarComponent,
    FilesShareMenuDialogComponent,
    PasswordRecoveryPageComponent,
    TwoFactorLoginPageComponent,
    SettingsDeleteTagDialogComponent,
    SettingsCreateEditTagDialogComponent,
    SecurityCheckDialogComponent,
    TwoFactorCheckDialogComponent,
    TwoFactorEditDialogComponent,
    TwoFactorEditComponent,
    TwoFactorGenerateRecoveryCodesDialogComponent,
    TwoFactorUseRecoveryCodeDialogComponent,
    FilesSignDialogComponent,
    FilesSignConfirmDialogComponent,
    FilesConvertToEtherpadDialogComponent,
    SettingsAskCurrentPasswordDialogComponent,
    LoadingDialogComponent,
    FilePreviewPageComponent,
    SetupBillingPageComponent,
    FilesSpaceInfoComponent,
    SettingsBillingCardComponent,
    FilesNoEnoughStorageDialogComponent,
    FilesNewMenuComponent,
    SettingsSessionCardComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ClipboardModule,
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
    MatChipsModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatExpansionModule,
    NgxFilesizeModule,
    NgResizeObserverPonyfillModule,
    LayoutModule,
    MatRadioModule,
    PdfJsViewerModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: true,
    }),
  ],
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    FileSystemService,
    TwoFactorService,
    UsersService,
    FilesUtilsService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
