import { Component, OnInit, ViewChild } from '@angular/core';
import { DashboardServiceService } from '../dashboard-service.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import applicantsList from '../data/applicantsData.json';



@Component({
  selector: 'app-dashboard-table',
  templateUrl: './dashboard-table.component.html',
  styleUrls: ['./dashboard-table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DashboardTableComponent {

  constructor(private DashboardServiceService: DashboardServiceService) { }
  // public applicantsList:{id:number, name:string, position: string, applied: string, 
  //   experience: number, availability: any, questions: any}[] = applicantsData;
  tableData: applicantsData[] = applicantsList;
  updatedTableData: applicantsData[] = applicantsList;
  flagList: applicantsData[] = JSON.parse(this.DashboardServiceService.getItem('flagList') || '[]');
  filterData: any = {};
  // Text messages
  buttonMessage: string = "Short Listed Candidates"
  shortListText: string = "Short List";
  filterMessage: string = "Filters";
  clearList: string = "Clear";

  // Flags
  isDataLoaded: boolean = false;
  isFilterVisible: boolean = false;
  isShortListVisible: boolean = false;
  ascOrder: boolean = true;
  sortedOrder: any = {
    id: true,
    name: true,
    position: true,
    applied: true,
    experience: true
  }

  ngOnInit() {
    this.isDataLoaded = true;
  }

  highlightData(): void {
    this.flagList.forEach(ap1 => {
      document.querySelectorAll('tr.applicant-row.item_' + ap1.id)[0].classList.add('flag_row')
    })
  }

  dataSource = new MatTableDataSource(this.tableData);
  columnsToDisplay = ['id', 'name', 'position', 'applied', 'experience'];
  expandedElement: applicantsData | null | undefined;

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.getFilterData(applicantsList);
    this.highlightData();
  }

  // Show Filters
  showFilters = () => {
    if (!this.isFilterVisible) {
      document.getElementById('filter-section')!.classList.remove('hide');
      this.filterMessage = "Close Filter";
    }
    else {
      document.getElementById('filter-section')!.classList.add('hide');
      this.filterMessage = "Filter";
    }

    this.isFilterVisible = !this.isFilterVisible;
  }

  // SHORTLIST A CANDIDATE OR REMOVE FROM SHORT LIST
  flagApplicant(event: Event, flagItem: applicantsData, flag: boolean) {
    let element = document.querySelectorAll('tr.item_' + flagItem.id)[0].classList;

    if (this.flagList.filter(item => item.id === flagItem.id).length == 0) {
      this.flagList.push(flagItem);
      element.add('flag_row');
      alert("Short listed " + flagItem.name);

    }
    else if (!flag) {
      this.flagList = this.flagList.filter(item => item.id !== flagItem.id)
      element.remove('flag_row');
      alert("Removed " + flagItem.name);
      if (this.isShortListVisible)
        this.updateTableData(this.flagList);

    }
    else {
      element.add('flag_row');
      alert("You have already Short listed " + flagItem.name);
    }
    this.DashboardServiceService.setItem('flagList', JSON.stringify(this.flagList));
  }

  // GET short listed candidates
  getFlaggedList() {
    let appData: any;
    if (this.isShortListVisible) {
      appData = this.tableData;
      this.buttonMessage = "View Short List";
      this.clearList = "";
    } else {
      appData = this.flagList;
      this.buttonMessage = "View Complete List";
      this.clearList = "Clear Short list";
    }
    this.updatedTableData = appData;
    this.updateTableData(appData);

    this.isShortListVisible = !this.isShortListVisible;
    this.resetFilter(false);
  }

  // Clear Flagged or shortlisted List
  resetList = () => {
    this.DashboardServiceService.clear();
    this.flagList = [];
    this.updateTableData([]);
  }
  // DATA For the FILTERS
  getFilterData = (applicantsList: applicantsData[]) => {
    this.columnsToDisplay.forEach((col: any) => {
      let tempList = applicantsList.map((item: any) => item[col]);
      let tempSet = new Set(tempList);
      tempList = [...tempSet]
      this.filterData[col] = tempList;
    })
  }

  // FILTER TABLE based on the selected conditions
  filterTable = (event: object, column: any, value: any) => {
    if (value !== "default") {
      this.resetFilter(false);
      let newData = this.updatedTableData.filter((applicant: any) => applicant[column] == value);
      (<HTMLInputElement>document.querySelectorAll("#" + column + "_filter")[0]).value = value;
      // this.updatedTableData = newData;
      this.updateTableData(newData);

    }
  }

  // Update table
  updateTableData = (data: applicantsData[]) => {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;

    setTimeout(() => { this.highlightData() }, 500);
  }

  // Reset Filter
  resetFilter = (resetData: boolean) => {
    let elements = document.getElementsByTagName('select');
    for (let i = 0; i < elements.length; i++) elements[i].value = "default";
    if (resetData) { this.updateTableData(this.tableData); this.updatedTableData = this.tableData; }
  }

  // Sort Date
  sortDate = (event: any, column: string) => {
    if (column === "applied") {
      event.preventDefault();
      let sortedData = this.tableData.sort((a: any, b: any) => {
        let date1: any = new Date(a.applied);
        let date2: any = new Date(b.applied);
        let data;
        if (this.ascOrder) {
          data = date1 - date2;
        }
        else {
          data = date2 - date1;
        }
        return data;
      });
      this.ascOrder = !this.ascOrder;

      this.updateTableData(sortedData)
    }
  }

  // SORT COLUMNS
  sortColumn = (event: Event, column: string) => {
    let sortCol = this.updatedTableData.sort((a: any, b: any) => {
      if (this.sortedOrder[column])
        return a[column] < b[column] ? -1 : (a[column] > b[column] ? 1 : 0);
      else
        return a[column] > b[column] ? -1 : (a[column] > b[column] ? 1 : 0);

    })

    this.sortedOrder[column] = !this.sortedOrder[column];

    this.updateTableData(sortCol);
    // return
  }
}




// imterface for the data
export interface applicantsData {
  id: number;
  name: string;
  position: string;
  applied: string;
  experience: number;
  availability: any;
  questions: any
}


