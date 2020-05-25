import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})
export class HostComponent implements OnInit {

  constructor(private Router:Router) { }
 session="session"
  ngOnInit(): void {
   
  }
  host(f:NgForm)
  {
    this.Router.navigate(['room',f.value.userName,this.session])
  }
}
