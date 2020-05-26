import { Component, OnInit } from '@angular/core';
import { Server } from 'http';
import { ServerService } from '../services/server.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-verfication',
  templateUrl: './verfication.component.html',
  styleUrls: ['./verfication.component.css']
})
export class VerficationComponent implements OnInit {
  resend=false;
  seconds:number=59;
  minute:number=1;
  id:any;
  res:any;

  constructor(private serverservice:ServerService,
              private route:ActivatedRoute,
              private router:Router) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id;

    setTimeout(() => {
      this.resend=true;
    }, 120000);

    setInterval(()=>{
      if(this.seconds>0) {
        this.seconds--;
      }
      else {
        this.minute--;
        this.seconds=59;
      }
    },1000);
  }

  Verify(form : NgForm) {
    const value = form.value;
    // console.log(this.id);
    this.serverservice.verifyUser(value.otp, this.id)
    .subscribe(
      (response) =>{
        console.log(response);
        this.res=response;
        this.router.navigate(['/']);
        localStorage.setItem('token', this.res.token);
        localStorage.setItem('name',this.res.name);
      },
      (error) =>{
        console.log(error);
      }, 
    );
  }

  onResend() {
    this.seconds=60;
    this.minute=1;
    setInterval(()=>{
      if(this.seconds>0) {
        this.seconds--;
      }
      else {
        this.minute--;
        this.seconds=60;
      }
    },1000000);
    this.resend = false;
    setTimeout(() => {
      this.resend = true;
    }, 120000);
    this.serverservice.resendOtp(this.id)
    .subscribe(
      (response) =>{
         console.log(response);
        },
      (error) =>{ 
        console.log(error);
      },
    );
  }

}
