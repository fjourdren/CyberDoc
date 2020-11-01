import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TwoFactorServiceProvider } from 'src/app/services/twofactor/twofactor-service-provider';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { allCountries as __allCountries, PhoneNumberCountry } from "./all-countries";
import { PhoneNumberUtil } from 'google-libphonenumber';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

const phoneNumberUtil = PhoneNumberUtil.getInstance();

@Component({
  selector: 'app-settings-twofa-configure-dialog',
  templateUrl: './settings-twofa-configure-dialog.component.html',
  styleUrls: ['./settings-twofa-configure-dialog.component.scss']
})
export class SettingsTwofaConfigureDialogComponent implements AfterViewInit {

  isSmartphoneOrTablet = 'ontouchstart' in window;
  loading = false;
  allCountries = __allCountries;

  qrURL: string;
  qrSecret: string;
  qrProtocolURL: string;
  formattedQrSecretLineOne: string;
  formattedQrSecretLineTwo: string;
  validPhoneNumber: string;
  invalidTokenError = false;
  invalidPhoneNumber = false;
  smsSent = false;

  phoneNumberForm = new FormGroup({
    countryCode: new FormControl(null, [Validators.required]),
    //https://www.twilio.com/docs/glossary/what-e164
    phoneNumber: new FormControl('', [Validators.required])
  });

  tokenForm = new FormGroup({
    token: new FormControl('', [Validators.required, Validators.pattern("\\d{6}")])
  })

  constructor(private dialogRef: MatDialogRef<SettingsTwofaConfigureDialogComponent>,
    private twoFAServiceProvider: TwoFactorServiceProvider,
    private userServiceProvider: UserServiceProvider,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public twofactormode: "sms" | "app") { }

  ngAfterViewInit(): void {
    switch (this.twofactormode) {
      case "sms": {
        break;
      }
      case "app": {
        setTimeout(() => this._generateQrCode(), 500);
        break;
      }
      default: {
        throw new Error(`Unknown 2FA mode : ${this.twofactormode}`);
      }
    }
  }

  @HostListener("keydown", ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      switch (this.twofactormode) {
        case "sms": {
          if (this.tokenForm.valid) {
            this.onOKBtnClick();
          } else if (this.phoneNumberForm.valid) {
            this.onSendSMSBtnClick();
          }
          break;
        }
        case "app": {
          if (this.tokenForm.valid) {
            this.onOKBtnClick();
          }
          break;
        }
        default: {
          throw new Error(`Unknown 2FA mode : ${this.twofactormode}`);
        }
      }
    }
  }

  onOKBtnClick() {
    if (!this.tokenForm.valid) return;
    this._setLoading(true);
    let promise: Promise<any>;

    this.invalidTokenError = false;
    switch (this.twofactormode) {
      case "sms": {
        promise = this._update2FAWithSMS();
        break;
      }
      case "app": {
        promise = this._update2FAWithApp();
        break;
      }
      default: {
        throw new Error(`Unknown 2FA mode : ${this.twofactormode}`);
      }
    }

    promise.then(() => {
      this._setLoading(false);
      this.dialogRef.close(true);
    }).catch(err => {
      this._setLoading(false);
      if (err instanceof HttpErrorResponse && err.status === 400) {
        this.invalidTokenError = true;
      } else {
        throw err;
      }
    })
  }

  onCancelBtnClick() {
    this.dialogRef.close(false);
  }

  onCopyBtnClick(){
    this.translateService.get("twofactor.secret_code_copied").toPromise().then(str => {
      this.snackBar.open(str);
    })
  }

  onSendSMSBtnClick() {
    if (!this.phoneNumberForm.valid) return;
    this.validPhoneNumber = undefined;
    this.smsSent = false;
    this.invalidPhoneNumber = false;
    const country: PhoneNumberCountry = this.phoneNumberForm.get('countryCode').value;
    const phoneNumber = `+${country.dialCode}${this.phoneNumberForm.get("phoneNumber").value}`;

    let validNumber = false;
    try {
        const __phoneNumber = phoneNumberUtil.parseAndKeepRawInput(phoneNumber, country.iso2Code);
        validNumber = phoneNumberUtil.isValidNumber(__phoneNumber);
    } catch (e) { }

    if (!validNumber) {
      this.invalidPhoneNumber = true;
      return;
    }

    this._setLoading(true);
    this.twoFAServiceProvider.default().sendTokenBySms(phoneNumber).toPromise().then(() => {
      this._setLoading(false);
      this.smsSent = true;
      this.validPhoneNumber = phoneNumber;
    }).catch(err => {
      this._setLoading(false);
      if (err instanceof HttpErrorResponse && err.status === 400) {
        this.invalidPhoneNumber = true;
      } else {
        throw err;
      }
    })
  }

  private _generateQrCode() {
    this._setLoading(true);
    const email = this.userServiceProvider.default().getActiveUser().email;
    this.twoFAServiceProvider.default().generateSecretUriAndQr(email).toPromise().then(res => {
      this._setLoading(false);
      this.qrURL = res.qr;
      const index = res.qr.indexOf("otpauth://");
      this.qrProtocolURL = res.qr.slice(index);
      this.qrSecret = res.secret;

      const qrSecretParts = res.secret.match(/.{1,4}/g);
      this.formattedQrSecretLineOne = [
        qrSecretParts[0], qrSecretParts[1], qrSecretParts[2], qrSecretParts[3]
      ].join(" ");
      this.formattedQrSecretLineTwo = [
        qrSecretParts[4], qrSecretParts[5], qrSecretParts[6], qrSecretParts[7]
      ].join(" ");
    });
  }

  private _setLoading(loading: boolean) {
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

  private async _update2FAWithApp() {
    const currentUser = this.userServiceProvider.default().getActiveUser();
    await this.twoFAServiceProvider.default().verifyTokenByApp(this.qrSecret, this.tokenForm.get('token').value).toPromise();

    await this.userServiceProvider.default().updateTwoFactor(
      true, /*twoFactorApp*/
      currentUser.twoFactorSms
    ).toPromise();

    await this.userServiceProvider.default().updateSecret(this.qrSecret).toPromise();
  }

  private async _update2FAWithSMS() {
    const currentUser = this.userServiceProvider.default().getActiveUser();
    await this.twoFAServiceProvider.default().verifyTokenBySms(
      this.validPhoneNumber,
      this.tokenForm.get('token').value).toPromise();

    await this.userServiceProvider.default().updateTwoFactor(
      currentUser.twoFactorApp,
      true /*twoFactorSms*/
    ).toPromise();

    await this.userServiceProvider.default().updatePhoneNumber(this.validPhoneNumber).toPromise();
  }
}
