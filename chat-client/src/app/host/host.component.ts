import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ServerService } from '../services/server.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonVarService } from '../services/common-var.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import Swal from 'sweetalert2';
import { AppComponent } from '../app.component';

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
  Id:any;
  myname:any
  Host=false;
  

  constructor(private Router: Router,
    private serverservice: ServerService,
    private httpClient: HttpClient,
    private ChangeService: CommonVarService,
    private appcomponent:AppComponent, ) { }
  session: any;
  ngOnInit(): void {
    this.Host=true
    if(localStorage.getItem('token'))
    {
     this.myname= localStorage.getItem('name')
     this.creatSession()
     this.Host=false;
   
  }
  else{
    this.ChangeService.loginopen()
  }
  this.ChangeService.loginIdentification
  .subscribe((event)=>
  {
      if(this.Host)
      {
        this.creatSession()
        this.Host=false
      }
  })
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
    this.appcomponent.load=true;
    if (localStorage.getItem("token")) {
      this.serverservice.gethosttoken(this.res.id)
        .subscribe((response: any) => {
          // console.log(response);
          this.serverservice.sethosttoken(response.token)
          localStorage.setItem('name',f.value.userName)
          this.Router.navigate(['room', 'Host', this.res.id])
          this.appcomponent.load=false;
        },
          (error) => {
            // console.log(error);
            this.appcomponent.load=false;
            Swal.fire(
              'Oops!',
              'Signup again!',
              'error'
            )
          }
        )
    }
    else {
      this.ChangeService.loginopen()
    }
  }
  creatSession()
  {
    this.appcomponent.load=true;
    this.serverservice.getSessionId()
    .subscribe(
      (response) => {
        this.res = response;
        this.link = "joinchat-3c9d4.web.app/room/" + this.res.id;
        this.linkbox = document.getElementById('sessionId');
        this.linkbox.value = this.link
        this.Id = document.getElementById('sessionIdID')
        this.Id.value = this.res.id
        this.appcomponent.load=false;
      },
      (error) => {
        if(error.error.error == "jwt expired")
        {
            this.ChangeService.loginopen();
        }
        else {
          this.appcomponent.error(error.error.error)
        }
        this.appcomponent.load=false;
      }
    )
  }
}
