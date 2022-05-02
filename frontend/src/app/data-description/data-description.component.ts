import { Component, OnInit, HostListener, ViewChildren, QueryList } from '@angular/core';
import { MongoService } from '../service/mongo.service';
import { InfluxService } from '../service/influx.service';
import { ModalService } from '../service/modal.service';
import { SortableHeader, SortColumn, SortDirection, SortEvent } from 'src/app/directive/sortable-header.directive';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

export interface ItagInfo {
  _id: any,
  items: {
    tag: string,
    unit: string,
    description: string
  }[]
}

export interface VariableListTable {
  tag: string;
  unit: string;
  description: string;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn<VariableListTable>;
  sortDirection: SortDirection;
}

interface SearchResult {
  valueList: VariableListTable[];
  total: number;
}

@Component({
  selector: 'app-data-description',
  templateUrl: './data-description.component.html',
  styleUrls: ['./data-description.component.css']
})
export class DataDescriptionComponent implements OnInit {
  @ViewChildren(SortableHeader) headers!: QueryList<SortableHeader<VariableListTable>>;

  tagInfo?: ItagInfo;
  tagList: string[] = [];
  isUnSaved: boolean = false;
  searchIcon = faSearch;
  private _contents: VariableListTable[] = []; 
  private _search$ = new Subject<void>();
  private _contentsList = new BehaviorSubject<VariableListTable[]>([]);  // List to display table
  private _total = new BehaviorSubject<number>(0);
  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
  };

  get vList(): VariableListTable[] { return this._contents; }
  get page() { return this._state.page; }
  set page(page: number) { this._state.page = page; this._search$.next(); }
  get pageSize() { return this._state.pageSize; }
  set pageSize(pageSize: number) { this._state.pageSize = pageSize; this._search$.next(); }
  get searchTerm() { return this._state.searchTerm; }
  set searchTerm(searchTerm: string) { this._state.searchTerm = searchTerm; this._search$.next(); }
  get total() { return this._total.asObservable(); }
  set sortColumn(sortColumn: SortColumn<VariableListTable>) { this._state.sortColumn = sortColumn; this._search$.next(); }
  set sortDirection(sortDirection: SortDirection) { this._state.sortDirection = sortDirection; this._search$.next(); }
  get contents() { return this._contentsList.asObservable(); }

  constructor(private mongo: MongoService, private modal: ModalService) {
    this._search$.pipe(
      switchMap(() => this._search()),
    ).subscribe(result => {
      this._contentsList.next(result.valueList);
      this._total.next(result.total);
    });
  }

  ngOnInit(): void {
    this.mongo.getTagInfo().subscribe(res => {
      this.tagInfo = res;
      this._contents = res.items;
      this._search$.next();
    })
  }

  save() {
    this.mongo.updateTagInfo(this.tagInfo!).subscribe(res => {
      this.modal.message('Saved', 'This dashboard was saved successfully.').then().catch();
      this.isUnSaved = false;
    }, (err) => {
      this.modal.message('Error', 'Save Failed. Something is wrong.').then().catch();
    });
  }

  onChangeTag(tag: string, idx: number) {
    this.tagInfo!.items[idx].tag = tag;
    this.isUnSaved = true;
  }


  onChangeUnit(unit: string, idx: number) {
    this.tagInfo!.items[idx].unit = unit;
    this.isUnSaved = true;
  }


  onChangeDesc(description: string, idx: number) {
    this.tagInfo!.items[idx].description = description;
    this.isUnSaved = true;
  }

  shouldConfirmOnBeforeunload() {
    return this.isUnSaved;
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(e: Event) {
    if (this.shouldConfirmOnBeforeunload()) {
      e.returnValue = true;
    }
  }

  // Event Handler for Sort
  onSort({column, direction}: SortEvent<VariableListTable>) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.sortColumn = column;
    this.sortDirection = direction;
  }

  public sort(values: VariableListTable[], column: SortColumn<VariableListTable>, direction: string): VariableListTable[] {
    if (direction === '' || column === '') {
      return values;
    } else {
      return [...values].sort((a, b) => {
        const res = ((v1: string, v2: string) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0)(`${a[column]}`, `${b[column]}`);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  // Search 
  private _search(): Observable<SearchResult> {
    const {sortColumn, sortDirection, pageSize, page, searchTerm} = this._state;
    // 1. sort
    let valueList = this.sort(this.vList, sortColumn, sortDirection);

    // 2. filter
    valueList = valueList.filter(itm => 
      itm.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itm.unit.toLowerCase().includes(searchTerm.toLowerCase()) 
    );
    const total = valueList.length;

    // 3. paginate
    valueList = valueList.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({valueList, total});
  }
}
