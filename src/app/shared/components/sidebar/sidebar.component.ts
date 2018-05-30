'use strict';
// Angular
import { Component, OnInit, AfterViewInit, ViewContainerRef, HostListener, ElementRef, ViewChild, Renderer2, ApplicationRef, ChangeDetectorRef, Input, Output, EventEmitter, ChangeDetectionStrategy   } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']

})
export class SidebarComponent implements OnInit {
  constructor () {}
  // Init
  ngOnInit() {}
}
