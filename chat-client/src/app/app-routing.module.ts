import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoomComponent } from './room/room.component';
import { ChatComponent } from './chat/chat.component';



const appRoutes: Routes=[
    {path:'', redirectTo:'homepage',pathMatch:'full'},
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