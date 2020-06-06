import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'chat-client';
 
  public load=false;

  constructor() {}

  ngOnInit() {
  }
 

  success(message) {
    Swal.fire(
      'Success',
      message,
      'success'
    )
  }

  error(message) {
    Swal.fire(
      'Please try again!',
      message,  
      'error'
    )
  }

  
}
