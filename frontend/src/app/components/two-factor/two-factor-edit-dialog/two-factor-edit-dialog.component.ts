import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  allCountries as __allCountries,
  PhoneNumberCountry,
} from './all-countries';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TwoFactorService } from 'src/app/services/twofactor/twofactor.service';
import { UsersService } from 'src/app/services/users/users.service';

const phoneNumberUtil = PhoneNumberUtil.getInstance();

@Component({
  selector: 'app-settings-twofa-configure-dialog',
  templateUrl: './two-factor-edit-dialog.component.html',
  styleUrls: ['./two-factor-edit-dialog.component.scss'],
})
export class TwoFactorEditDialogComponent implements AfterViewInit {
  isSmartphoneOrTablet = 'ontouchstart' in window;
  loading = false;
  allCountries = __allCountries;
  email: string;
  qrURL: string;
  qrSecret: string;
  qrProtocolURL: SafeUrl;
  formattedQrSecretLineOne: string;
  formattedQrSecretLineTwo: string;
  validPhoneNumber: string;
  invalidTokenError = false;
  tooManySMSSentError = false;
  tooManyInvalidCodesError = false;
  invalidPhoneNumber = false;
  smsSent = false;
  theme = 'indigo-pink';

  phoneNumberForm = new FormGroup({
    countryCode: new FormControl(null, [Validators.required]),
    // https://www.twilio.com/docs/glossary/what-e164
    phoneNumber: new FormControl('', [Validators.required]),
  });

  tokenForm = new FormGroup({
    token: new FormControl('', [
      Validators.required,
      Validators.pattern('\\d{6}'),
    ]),
  });

  constructor(
    private dialogRef: MatDialogRef<TwoFactorEditDialogComponent>,
    private dialog: MatDialog,
    private twoFactorService: TwoFactorService,
    private usersService: UsersService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
    this.email = this.usersService.getActiveUser().email;
  }

  ngAfterViewInit(): void {
    switch (this.data.twoFactorMode) {
      case 'sms':
      case 'email': {
        break;
      }
      case 'app': {
        setTimeout(() => this._generateQrCode(), 500);
        break;
      }
      default: {
        throw new Error(`Unknown 2FA mode : ${this.data.twoFactorMode}`);
      }
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent): void {
    if (evt.key === 'Enter') {
      switch (this.data.twoFactorMode) {
        case 'sms': {
          if (this.tokenForm.valid) {
            this.onOKBtnClick();
          } else if (this.phoneNumberForm.valid) {
            this.onSendSMSBtnClick();
          }
          break;
        }
        case 'email':
        case 'app': {
          if (this.tokenForm.valid) {
            this.onOKBtnClick();
          }
          break;
        }
        default: {
          throw new Error(`Unknown 2FA mode : ${this.data.twoFactorMode}`);
        }
      }
    }
  }

  onOKBtnClick(): void {
    if (!this.tokenForm.valid) {
      return;
    }
    this._setLoading(true);
    let promise: Promise<any>;

    this.invalidTokenError = false;
    this.tooManyInvalidCodesError = false;

    switch (this.data.twoFactorMode) {
      case 'sms': {
        promise = this._update2FA('sms');
        break;
      }
      case 'app': {
        promise = this._update2FA('app');
        break;
      }
      case 'email': {
        promise = this._update2FA('email');
        break;
      }
      default: {
        throw new Error(`Unknown 2FA mode : ${this.data.twoFactorMode}`);
      }
    }

    promise
      .then(() => {
        this._setLoading(false);
        this.dialogRef.close(true);
      })
      .catch((err) => {
        this._setLoading(false);
        if (err instanceof HttpErrorResponse && err.status === 403) {
          this.invalidTokenError = true;
        } else if (err instanceof HttpErrorResponse && err.status === 429) {
          this.tooManyInvalidCodesError = true;
        } else {
          throw err;
        }
      });
  }

  onCancelBtnClick(): void {
    this.dialogRef.close(false);
  }

  onCopyBtnClick(): void {
    this.translateService
      .get('twofactor.secret_code_copied')
      .toPromise()
      .then((str) => {
        this.snackBar.open(str, null, {
          duration: 2500,
        });
      });
  }

  onSendSMSBtnClick(): void {
    if (!this.phoneNumberForm.valid) {
      return;
    }
    this.validPhoneNumber = undefined;
    this.smsSent = false;
    this.invalidPhoneNumber = false;
    this.tooManySMSSentError = false;
    const country: PhoneNumberCountry = this.phoneNumberForm.get('countryCode')
      .value;
    const phoneNumber = `+${country.dialCode}${
      this.phoneNumberForm.get('phoneNumber').value
    }`;

    let validNumber = false;
    try {
      const _phoneNumber = phoneNumberUtil.parseAndKeepRawInput(
        phoneNumber,
        country.iso2Code,
      );
      validNumber = phoneNumberUtil.isValidNumber(_phoneNumber);
    } catch (e) {}

    if (!validNumber) {
      this.invalidPhoneNumber = true;
      return;
    }

    this._setLoading(true);
    this.usersService
      .updateProfile(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        phoneNumber,
      )
      .toPromise()
      .then(() => {
        this.twoFactorService
          .sendTokenBySms()
          .toPromise()
          .then(() => {
            this._setLoading(false);
            this.smsSent = true;
            this.validPhoneNumber = phoneNumber;
          })
          .catch((err) => {
            this._setLoading(false);
            if (err instanceof HttpErrorResponse && err.status === 403) {
              this.invalidPhoneNumber = true;
            } else if (err instanceof HttpErrorResponse && err.status === 429) {
              this.tooManySMSSentError = true;
            } else {
              throw err;
            }
          });
      });
  }

  private _generateQrCode(): void {
    this._setLoading(true);
    const email = this.usersService.getActiveUser().email;
    this.twoFactorService
      .generateSecretUriAndQr()
      .toPromise()
      .then((res) => {
        this._setLoading(false);
        this.qrURL = res.msg.qr;
        this.qrSecret = res.msg.secret;
        // https://github.com/google/google-authenticator/wiki/Key-Uri-Format
        const otpURL = `otpauth://totp/CyberDoc:${email}?secret=${this.qrSecret}&issuer=CyberDoc&digits=6&period=30`;
        this.qrProtocolURL = this.sanitizer.bypassSecurityTrustUrl(otpURL);
        const qrSecretParts = this.qrSecret.match(/.{1,4}/g);
        this.formattedQrSecretLineOne = [
          qrSecretParts[0],
          qrSecretParts[1],
          qrSecretParts[2],
          qrSecretParts[3],
        ].join(' ');
        this.formattedQrSecretLineTwo = [
          qrSecretParts[4],
          qrSecretParts[5],
          qrSecretParts[6],
          qrSecretParts[7],
        ].join(' ');
      });
  }

  private _setLoading(loading: boolean): void {
    this.loading = loading;
    this.dialogRef.disableClose = loading;
    if (loading) {
      this.tokenForm.disable();
      this.phoneNumberForm.disable();
    } else {
      this.tokenForm.enable();
      this.phoneNumberForm.enable();
    }
  }

  private async _update2FA(type: 'app' | 'sms' | 'email'): Promise<void> {
    const tokenForm = this.tokenForm.get('token').value;
    await this.usersService
      .enableTwoFactor(type, tokenForm)
      .toPromise()
      .then(() => {
        // TODO 2FA RECOVERY CODES
        // this.dialog.open(TwoFactorGenerateRecoveryCodesDialogComponent, {
        //   maxWidth: '500px',
        //   disableClose: true,
        // });
        this.dialogRef.close(true);
      });
  }
}
