import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-settings-ask-current-password-dialog',
  templateUrl: './settings-ask-current-password-dialog.component.html',
  styleUrls: ['./settings-ask-current-password-dialog.component.scss'],
})
export class SettingsAskCurrentPasswordDialogComponent implements OnInit {
  passwordForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    public verifyPasswordDialog: MatDialogRef<SettingsAskCurrentPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent): void {
    if (evt.key === 'Escape') {
      this.onCancel();
    }
  }

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      password: [null, Validators.required],
    });
  }

  onCancel(): void {
    this.verifyPasswordDialog.close();
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }
    const password = this.passwordForm.get('password').value;
    this.verifyPasswordDialog.close(password);
  }
}
