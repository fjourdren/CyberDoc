import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { MatRadioModule } from '@angular/material/radio';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgResizeObserverPonyfillModule } from 'ng-resize-observer';
import { LayoutModule } from '@angular/cdk/layout';
import { NgxFilesizeModule } from 'ngx-filesize';
import { CookieService } from 'ngx-cookie-service';
import * as Sentry from "@sentry/angular";

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

import { SettingsMenuComponent } from './components/settings/settings-menu/settings-menu.component';
import { SettingsProfileComponent } from './components/settings/settings-profile/settings-profile.component';
import { SettingsSecurityComponent, SettingsSecurityDialogComponent } from './components/settings/settings-security/settings-security.component';

import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { LogoutPageComponent } from './pages/logout-page/logout-page.component';
import { SettingsProfilePageComponent } from './pages/settings-profile-page/settings-profile-page.component';
import { SettingsSecurityPageComponent } from './pages/settings-security-page/settings-security-page.component'
import { FilesPageComponent } from './pages/files-page/files-page.component';;

import { UnhandledErrorDialogComponent } from './components/global/unhandled-error-dialog/unhandled-error-dialog.component';

import { FileSystemProvider } from './services/filesystems/file-system-provider';
import { FilesUtilsService } from './services/files-utils/files-utils.service';
import { UserServiceProvider } from './services/users/user-service-provider';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RemainingTimePipe } from './pipes/remaining-time/remaining-time.pipe';
import { GlobalErrorHandler } from './global-error-handler';
import { environment } from '../environments/environment';
import { FilesTagsInputComponent } from './components/files/files-tags-input/files-tags-input.component';
import { FilesCreateTagDialogComponent } from './components/files/files-create-tag-dialog/files-create-tag-dialog.component';
import { FilesShareDialogComponent } from './components/files/files-share-dialog/files-share-dialog.component';
import { FilesFilterDialogComponent } from './components/files/files-filter-dialog/files-filter-dialog.component';
import { FilesFilterToolbarComponent } from './components/files/files-filter-toolbar/files-filter-toolbar.component';
import { SettingsMainToolbarComponent } from './components/settings/settings-main-toolbar/settings-main-toolbar.component';
import { Router } from '@angular/router';
import { FilesShareMenuDialogComponent } from './components/files/files-share-menu-dialog/files-share-menu-dialog.component';
import { PasswordRecoveryPageComponent } from './pages/password-recovery-page/password-recovery-page.component';
import { ResetPasswordPageComponent } from './pages/reset-password-page/reset-password-page.component';
import { TwoFactorPageComponent } from './pages/two-factor-page/two-factor-page.component';
import { TwoFactorRegisterDialogComponent, TwoFactorRegisterPageComponent } from './pages/two-factor-register-page/two-factor-register-page.component';

// AoT requires an exported function for factories
export const HttpLoaderFactory = (httpClient: HttpClient) => new TranslateHttpLoader(httpClient);

const FILES_COMPONENTS = [
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
    FilesGenericTableBottomsheetComponent,
    FilesTagsInputComponent,
    FilesCreateTagDialogComponent,
    FilesFilterDialogComponent,
];

const SETTINGS_COMPONENTS = [
    SettingsMenuComponent,
    SettingsProfileComponent,
    SettingsSecurityComponent,
    SettingsSecurityDialogComponent,
    SettingsMainToolbarComponent
];

const LOCAL_ERROR_HANDLER = [
    {provide: ErrorHandler, useClass: GlobalErrorHandler}
];

const SENTRY_ERROR_HANDLER = [
    {
        provide: ErrorHandler,
        useValue: Sentry.createErrorHandler({
            showDialog: true,
        }),
    },
    {
        provide: Sentry.TraceService,
        deps: [Router],
    },
    {
        provide: APP_INITIALIZER,
        useFactory: () => () => {
        },
        deps: [Sentry.TraceService],
        multi: true,
    },
];

let ERROR_HANDLER;

if (environment.useSentry) {
    ERROR_HANDLER = SENTRY_ERROR_HANDLER;
} else {
    ERROR_HANDLER = LOCAL_ERROR_HANDLER;
}

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
    FilesCreateTagDialogComponent,
    FilesShareDialogComponent,
    FilesFilterToolbarComponent,
    FilesShareMenuDialogComponent,
    PasswordRecoveryPageComponent,
    ResetPasswordPageComponent,
    TwoFactorPageComponent,
    TwoFactorRegisterDialogComponent,
    TwoFactorRegisterPageComponent,
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
    MatChipsModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatExpansionModule,
    NgxFilesizeModule,
    NgResizeObserverPonyfillModule,
    LayoutModule,
    MatRadioModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    ...ERROR_HANDLER,
    CookieService,
    FileSystemProvider,
    UserServiceProvider,
    FilesUtilsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
