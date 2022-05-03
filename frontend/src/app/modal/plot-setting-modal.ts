import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IplotMulti } from '../ts-multi/tsmulti.component';
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
            <div class="col-2" *ngFor="let itm of setting.items; index as i">
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
                  <label class="textColor">yrange min</label>
                  <br />
                  <input
                    #yrangeMin
                    type="text"
                    [value]="itm.yrange?.min"
                    (input)="setYrangeMin(yrangeMin.value, i)"
                    class="textColor SecondaryBGColor"
                    style="width: 30%; border-color: white; border-width: 1px"
                  />
                </div>
                <div class="mb-3">
                  <label class="textColor">yrange max</label>
                  <br />
                  <input
                    #yrangeMax
                    type="text"
                    [value]="itm.yrange?.max"
                    (input)="setYrangeMax(yrangeMax.value, i)"
                    class="textColor SecondaryBGColor"
                    style="width: 30%; border-color: white; border-width: 1px"
                  />
                </div>
              </form>
              <button
                class="btn btn-outline-light textColor"
                (click)="setDefaultYrange(i)"
              >
                set default yrange
              </button>
            </div>
            <fa-icon
              *ngIf="setting.items.length < 6"
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
export class PlotSetting {
  plusIcon = faCirclePlus;
  deleteIcon = faTrashAlt;

  _setting?: IplotMulti;
  tagListAll: string[] = [];
  yrangeList: IdefaultYranges = {};

  constructor(public activeModal: NgbActiveModal) {}

  set setting(data: IplotMulti) {
    this._setting = data;
  }

  get setting(): IplotMulti {
    return this._setting!;
  }

  onSelectPlotTag(tag: string, idx: number) {
    this.setting.items[idx] = {
      tag: tag,
      yrange: {
        min: this.yrangeList[tag].min,
        max: this.yrangeList[tag].max,
      },
    };
  }

  addTag() {
    this.setting.items.push({
      tag: this.tagListAll[0],
      yrange: {
        min: this.yrangeList[this.tagListAll[0]].min,
        max: this.yrangeList[this.tagListAll[0]].max,
      },
    });
  }

  removeTag(idx: number) {
    this.setting.items.splice(idx, 1);
  }

  setYrangeMin(val: string, idx: number) {
    this.setting.items[idx].yrange!.min = Number(val);
  }

  setYrangeMax(val: string, idx: number) {
    this.setting.items[idx].yrange!.max = Number(val);
  }

  setDefaultYrange(idx: number) {
    this.setting.items[idx].yrange = {
      min: this.yrangeList[this.setting.items[idx].tag].min,
      max: this.yrangeList[this.setting.items[idx].tag].max,
    };
  }
}
