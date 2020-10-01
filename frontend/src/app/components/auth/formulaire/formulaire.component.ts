import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-formulaire',
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.css']
})
export class FormulaireComponent implements OnInit {
  addressForm = this.fb.group({
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    email: [null, Validators.required],
    password: [null, Validators.required],
    repeat: [null, Validators.required],
    state: ['collaborator', Validators.required],
  });

  hide = true;
  hasUnitNumber = false;

  email = new FormControl('', [Validators.required, Validators.email]);

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    alert('Thanks!');
  }

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.email.hasError('email') ? 'Not a valid email' : '';
  }
  ngOnInit() {
    this.email = new FormControl('', [Validators.required, Validators.email]);
  }
  
}
