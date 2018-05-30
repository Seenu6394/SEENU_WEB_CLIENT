import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from '@angular/forms';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { HeaderComponent, ChatComponent, SidebarComponent } from '../shared';
import { NgxCarouselModule } from 'ngx-carousel';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        LayoutRoutingModule,
        NgxCarouselModule,
        NgbModule.forRoot(),
    ],
    declarations: [
        LayoutComponent,
        HeaderComponent,
        SidebarComponent,
        ChatComponent
    ]
})
export class LayoutModule { }
