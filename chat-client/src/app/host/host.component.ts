import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ServerService } from '../services/server.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';



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

  constructor(private Router: Router,
    private serverservice: ServerService,
    private httpClient: HttpClient) { }
  session: any;
  ngOnInit(): void {

    this.serverservice.getSessionId()
      .subscribe(
        (response) => {
          this.res = response;
          this.link = "joinchat-3c9d4.web.app/room/" + this.res.id;
          this.linkbox = document.getElementById('sessionId');
          this.linkbox.value = this.link
        },
        (error) => {
          console.log(error);
        }
      )
  }

  copytext() {
    this.copyText = document.getElementById("sessionId");
    this.copyText.select();
    this.copyText.setSelectionRange(0, 99999)
    document.execCommand("copy");

  }

  host(f: NgForm) {
    if (localStorage.getItem("token")) {
      this.serverservice.gethosttoken(this.res.id)
        .subscribe((response: any) => {
          console.log(response)
          this.serverservice.sethosttoken(response.token)
          this.Router.navigate(['room', 'Host', this.res.id])

        }
        )
    }


  }
}
