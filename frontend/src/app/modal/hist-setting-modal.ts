import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IplotHist } from '../histogram/histogram.component';
import { faCirclePlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { IdefaultYranges } from '../service/influx.service';

@Component({
  template: `
    <div class="SecondaryBGColor">
      <div class="modal-header">
        <h4 class="textColor">Graph Settings</h4>
      </div>
      <div class="card SecondaryBGColor">
        <div class="card-body">
          <div class="row">
            <div class="col-6" *ngFor="let itm of setting.items; index as i">
              <label class="col-11 textColor">tag{{ i + 1 }}</label>
              <fa-icon
                class="col-2 PrimaryColor"
                [icon]="deleteIcon"
                size="lg"
                (click)="removeTag(i)"
              ></fa-icon>
              <select
                #tagSelect
                class="form-select textColor SecondaryBGColor"
                (change)="onSelectPlotTag(tagSelect.value, i)"
              >
                <option
                  *ngFor="let tag of tagListAll"
                  [selected]="tag === itm.tag"
                >
                  {{ tag }}
                </option>
              </select>
              <br />
              <form>
                <div class="mb-3">
                  <label class="textColor">bin</label>
                  <br />
                  <input
                    #bin
                    type="text"
                    [value]="itm.bin"
                    (input)="setBin(bin.value, i)"
                    class="textColor SecondaryBGColor"
                    style="width: 30%; border-color: white; border-width: 1px"
                  />
                </div>
              </form>
            </div>
            <fa-icon
              *ngIf="setting.items.length < 2"
              class="col-1 PrimaryColor"
              [icon]="plusIcon"
              size="2x"
              (click)="addTag()"
              style="margin-top: 28px"
            ></fa-icon>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button
          class="btn btn-outline-light textColor SecondaryBGColor"
          (click)="activeModal.close(setting)"
        >
          Update
        </button>
      </div>
    </div>
  `,
})
export class HistSetting {
  plusIcon = faCirclePlus;
  deleteIcon = faTrashAlt;

  _setting?: IplotHist;
  tagListAll: string[] = [];
  yrangeList: IdefaultYranges = {};

  constructor(public activeModal: NgbActiveModal) {}

  set setting(data: IplotHist) {
    this._setting = data;
  }

  get setting(): IplotHist {
    return this._setting!;
  }

  onSelectPlotTag(tag: string, idx: number) {
    this.setting.items[idx].tag = tag;
    this.setting.items[idx].xbin = undefined;
  }

  addTag() {
    this.setting.items.push({
      tag: this.tagListAll[0],
      bin: 15,
    });
  }

  removeTag(idx: number) {
    this.setting.items.splice(idx, 1);
  }

  setBin(bin: string, idx: number) {
    const end = this.yrangeList[this.setting.items[idx].tag].max;
    const start = this.yrangeList[this.setting.items[idx].tag].min;
    const size = (end - start) / Number(bin);

    this.setting.items[idx].xbin = {
      end: end,
      size: size,
      start: start,
    };
    this.setting.items[idx].bin = Number(bin);
  }
}
