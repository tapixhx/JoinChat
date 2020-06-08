import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonVarService } from './services/common-var.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'chat-client';
 
  public load=false;

  constructor(private changeService:CommonVarService) {}

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
