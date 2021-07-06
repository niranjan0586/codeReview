import { Component } from '@angular/core';
import applicantsData from './data/applicantsData.json';
import { DashboardTableComponent } from './dashboard-table/dashboard-table.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'json-file-read-angular';
  public applicantsList:{id:number, name:string, position: string, applied: string, 
    experience: number, availability: any, questions: any}[] = applicantsData;

  public dashboard = DashboardTableComponent;
}

