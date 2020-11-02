import {Component, OnInit, ViewChild} from '@angular/core';
import {TwoFactorEditComponent} from '../../components/two-factor/two-factor-edit/two-factor-edit.component';

@Component({
    selector: 'app-two-factor-register-page',
    templateUrl: './two-factor-register-page.component.html',
    styleUrls: ['./two-factor-register-page.component.scss']
})

export class TwoFactorRegisterPageComponent implements OnInit {
    @ViewChild(TwoFactorEditComponent) twoFactorEditComponent;
    twoFactorApp: boolean;
    twoFactorSms: boolean;

    constructor() {
    }

    ngOnInit(): void {

    }

    updateTwoFactorApp($event: boolean): void {
        this.twoFactorApp = $event.valueOf();
    }

    updateTwoFactorSms($event: boolean): void {
        this.twoFactorSms = $event.valueOf();
    }
}
