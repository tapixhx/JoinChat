import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OpenViduVideoComponent } from './ov-video.component';
import { UserVideoComponent } from './user-video.component';

@NgModule({
  declarations: [
    AppComponent,
    OpenViduVideoComponent,
    UserVideoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
