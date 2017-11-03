import {Component, OnInit, AfterViewInit, Renderer, ElementRef} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';
import {JhiLanguageService, EventManager} from 'ng-jhipster';

import {LoginService} from './login.service';
import {StateStorageService} from '../auth/state-storage.service';
import {Register} from '../../account/register/register.service';
import {PasswordResetModalService} from '../../account/password-reset/init/password-reset-init-modal.service';

@Component({
    selector: 'jhi-login-modal',
    templateUrl: './login.component.html'
})
export class JhiLoginModalComponent implements OnInit, AfterViewInit {
    authenticationError: boolean;
    password: string;
    rememberMe: boolean;
    username: string;
    credentials: any;
    isRegistration = false;
    confirmPassword: string;
    doNotMatch: string;
    error: string;
    errorEmailExists: string;
    errorUserExists: string;
    registerAccount: any;
    success: boolean;

    constructor(private eventManager: EventManager,
                private languageService: JhiLanguageService,
                private loginService: LoginService,
                private registerService: Register,
                private stateStorageService: StateStorageService,
                private passwordResetModalService: PasswordResetModalService,
                private elementRef: ElementRef,
                private renderer: Renderer,
                private router: Router,
                public activeModal: NgbActiveModal) {
        this.credentials = {};
    }

    ngOnInit() {
        this.languageService.addLocation('login');
        this.success = false;
        this.registerAccount = {};
    }

    ngAfterViewInit() {
        if (this.isRegistration) {
            this.renderer.invokeElementMethod(this.elementRef.nativeElement.querySelector('#login'), 'focus', []);
        } else {
            this.renderer.invokeElementMethod(this.elementRef.nativeElement.querySelector('#usernameLogin'), 'focus', []);
        }
    }

    cancel() {
        this.credentials = {
            username: null,
            password: null,
            rememberMe: true
        };
        this.authenticationError = false;
        this.activeModal.dismiss('cancel');
    }

    login() {
        this.loginService.login({
            username: this.username,
            password: this.password,
            rememberMe: this.rememberMe
        }).then(() => {
            this.authenticationError = false;
            this.activeModal.dismiss('login success');
            if (this.router.url === '/register' || (/activate/.test(this.router.url)) ||
                this.router.url === '/finishReset' || this.router.url === '/requestReset') {
                this.router.navigate(['']);
            }

            this.eventManager.broadcast({
                name: 'authenticationSuccess',
                content: 'Sending Authentication Success'
            });

            // // previousState was set in the authExpiredInterceptor before being redirected to login modal.
            // // since login is succesful, go to stored previousState and clear previousState
            const redirect = this.stateStorageService.getUrl();
            if (redirect) {
                this.router.navigate([redirect]);
            }
        }).catch(() => {
            this.authenticationError = true;
        });
    }

    requestResetPassword() {
        this.activeModal.dismiss('to state requestReset');
        this.passwordResetModalService.open();
        // this.router.navigate(['/reset', 'request']);
    }

    register() {
        if (this.registerAccount.password !== this.confirmPassword) {
            this.doNotMatch = 'ERROR';
        } else {
            this.doNotMatch = null;
            this.error = null;
            this.errorUserExists = null;
            this.errorEmailExists = null;
            this.languageService.getCurrent().then((key) => {
                this.registerAccount.langKey = key;
                this.registerService.save(this.registerAccount).subscribe(() => {
                    this.success = true;
                }, (response) => this.processError(response));
            });
        }
    }

    private processError(response) {
        this.success = null;
        if (response.status === 400 && response._body === 'login already in use') {
            this.errorUserExists = 'ERROR';
        } else if (response.status === 400 && response._body === 'email address already in use') {
            this.errorEmailExists = 'ERROR';
        } else {
            this.error = 'ERROR';
        }
    }
}
