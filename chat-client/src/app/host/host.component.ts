import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})
export class HostComponent implements OnInit {

  res:any;
  copyText:any;
  link:any;
  linkbox:any;

  constructor(private Router:Router,
              private serverservice: ServerService,) { }
 session="session"
  ngOnInit(): void {

    this.serverservice.getSessionId()
    .subscribe(
      (response) => {
        console.log(response);
        this.res=response;
        console.log(this.res.id);
        this.link="joinchat-3c9d4.web.app/room/"+this.res.id;
        this.linkbox=document.getElementById('sessionId');
        this.linkbox.value = this.link
        console.log(this.linkbox.value);
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
    // alert("Copied the text: " + this.copyText.value);
  }

  host(f:NgForm)
  {
    this.Router.navigate(['room',f.value.userName,this.session])
  }
}
