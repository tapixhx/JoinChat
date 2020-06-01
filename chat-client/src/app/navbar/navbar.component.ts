import { Component, OnInit } from '@angular/core';
import { CommonVarService } from '../services/common-var.service';
import { NgForm } from '@angular/forms';
import { ServerService } from '../services/server.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Subscribable, Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import Swal from 'sweetalert2';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  wnt_login = false;
  wnt_signup = false;
  id: any;
  res: any;
  cross=false
  auth: any;
  ChangeLoginSubscription:Subscription
  ChangeSignupSubscription:Subscription
  constructor(private serverservice: ServerService,
    private router: Router,
    public authservice: AuthService,
    private changeService: CommonVarService,
    private ngxservice:NgxUiLoaderService,
    private appcomponent:AppComponent,) { }

  ngOnInit(): void {
    this.wnt_login = false;
    this.wnt_signup = false;
    this.ChangeSignupSubscription=this.changeService.signupchange.subscribe((event => {
      this.wnt_signup = event
    }))
    this.ChangeLoginSubscription=this.changeService.loginchange.subscribe((event => {
      this.wnt_login = event
    }))


  }

  login() {
    this.wnt_login = true;
  }

  signup() {
    this.wnt_signup = true;
  }
  click()
  {
    this.cross = !this.cross;
    
  }

  close() {
    this.wnt_login = false;
    this.wnt_signup = false;
    this.changeService.loginoff()
    this.changeService.signupOff()
  }

  loginform(form: NgForm) {
    this.ngxservice.start();
    const value = form.value;
    this.serverservice.login(value)
      .subscribe(
        (response) => {
          console.log(response);
          this.wnt_login = false;
          this.res = response;
          localStorage.setItem('token', this.res.token);
          localStorage.setItem('name', this.res.name);
          this.ngxservice.stop();
          this.changeService.logined()
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          if (error.error.message === "User is not verified") {
            this.router.navigate(['/verify', error.error.userId]);
            this.wnt_login = false;
            this.ngxservice.stop();
          }
          this.appcomponent.error(error.error.error);
        }
      )
  }

  signupform(sform: NgForm) {
    this.ngxservice.start();
    const value = sform.value;
    this.serverservice.signup(value)
      .subscribe(
        (response) => {
          console.log(response);
          this.id = response;
          this.wnt_signup = false;
          this.router.navigate(['/verify', this.id.userId]);
          this.ngxservice.stop();
        },
        (error) => {
          console.log(error);
          this.ngxservice.stop();
          this.appcomponent.error(error.error.error);
        }
      )
  }



}
