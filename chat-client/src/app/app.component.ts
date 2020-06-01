
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'chat-client';
 

  constructor(private ngxservice:NgxUiLoaderService) {}

  ngOnInit() {
    this.ngxservice.start();
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
