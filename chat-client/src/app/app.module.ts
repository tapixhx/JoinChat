import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { UserVideoComponent } from './user-video.component';
import { OpenViduVideoComponent } from './ov-video.component';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ChangeService } from './services/chat.service';
import { AppRoutingModule } from './app-routing.module';
import { ChatComponent } from './chat/chat.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { HostComponent } from './host/host.component';
import { ConfirmPasswordDirective } from './shared/confirm-password.directive';
import { VerficationComponent } from './verfication/verfication.component';
import { MainViduVideoComponent } from './main-video.component';
import { ServerService } from './services/server.service';

@NgModule({
  declarations: [
    AppComponent,
    UserVideoComponent,
    OpenViduVideoComponent,
    HomeComponent,
    RoomComponent,
    LoginComponent,
    SignupComponent,
    ChatComponent,
    NavbarComponent,
    FooterComponent,
    HostComponent,
    ConfirmPasswordDirective,
    VerficationComponent,
    MainViduVideoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,

  ],
  providers: [ChangeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
