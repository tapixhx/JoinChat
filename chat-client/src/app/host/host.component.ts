import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ServerService } from '../services/server.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonVarService } from '../services/common-var.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})
export class HostComponent implements OnInit {

  res: any;
  copyText: any;
  link: any;
  linkbox: any;
  Id: any;

  constructor(private Router: Router,
    private serverservice: ServerService,
    private httpClient: HttpClient,
    private ChangeService: CommonVarService,
    private ngxservice: NgxUiLoaderService, ) { }
  session: any;
  ngOnInit(): void {
    this.ngxservice.start();
    if (localStorage.getItem('token')) {
      this.serverservice.getSessionId()
        .subscribe(
          (response) => {
            this.res = response;
            this.link = "joinchat-3c9d4.web.app/room/" + this.res.id;
            this.linkbox = document.getElementById('sessionId');
            this.linkbox.value = this.link
            this.Id = document.getElementById('sessionIdID')
            this.Id.value = this.res.id;
            this.ngxservice.stop();
          },
          (error) => {
            console.log(error);
            this.ngxservice.stop();
            Swal.fire(
              'Oops!',
              'LogIn or SignUp and try again!',
              'error'
            )
          }
        )
    }
    else {
      this.ChangeService.loginopen()
      this.ngxservice.stop();
    }
  }

  copytext() {
    this.copyText = document.getElementById("sessionId");
    this.copyText.select();
    this.copyText.setSelectionRange(0, 99999)
    document.execCommand("copy");
  }
  copyID() {
    this.copyText = document.getElementById("sessionIdID");
    this.copyText.select();
    this.copyText.setSelectionRange(0, 99999)
    document.execCommand("copy");
  }

  host(f: NgForm) {
    this.ngxservice.start();
    if (localStorage.getItem("token")) {
      this.serverservice.gethosttoken(this.res.id)
        .subscribe((response: any) => {
          console.log(response)
          this.serverservice.sethosttoken(response.token)
          this.Router.navigate(['room', 'Host', this.res.id])
          this.ngxservice.stop();
        },
          (error) => {
            console.log(error);
            this.ngxservice.stop();
            Swal.fire(
              'Oops!',
              'LogIn or SignUp again and try again!',
              'error'
            )
          }
        )
    }
    else {
      this.ChangeService.loginopen()
    }
  }
}
