import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
    user: any = {};
    public loading = false;
    constructor(
      public router: Router)  {
    }

    ngOnInit() {
    }

    onLoggedin(users) {
    }

}
