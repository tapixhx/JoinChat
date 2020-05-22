import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoomComponent } from './room/room.component';
import { ChatComponent } from './chat/chat.component';
import { HomeComponent } from './home/home.component';



const appRoutes: Routes=[
    {path:'', component:HomeComponent},
    {path:'room/:id',component:RoomComponent},
    {path:'room',component:RoomComponent},
    {path:'chat',component:ChatComponent},
]

@NgModule({
    imports: [RouterModule.forRoot(appRoutes,
    {
        anchorScrolling:'enabled',
        onSameUrlNavigation:'reload',
        scrollPositionRestoration:'top',
    })],
exports:[RouterModule]
})
    
export class AppRoutingModule{ }