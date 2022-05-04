import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IplotSingle } from '../ts-single/ts-single.component';
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
            <div class="col-12">
              <select
                #tagXSelect
                class="form-select textColor SecondaryBGColor"
                (change)="onSelectPlotTag(tagXSelect.value)"
              >
                <option
                  *ngFor="let tag of tagListAll"
                  [selected]="tag === setting.tag"
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
                    [value]="setting.yrange?.min"
                    (input)="setYrangeMin(yrangeMin.value)"
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
                    [value]="setting.yrange?.max"
                    (input)="setYrangeMax(yrangeMax.value)"
                    class="textColor SecondaryBGColor"
                    style="width: 30%; border-color: white; border-width: 1px"
                  />
                </div>
                <div class="mb-3">
                  <label class="textColor">bin</label>
                  <br />
                  <input
                    #bin
                    type="text"
                    [value]="setting.bin"
                    (input)="setBin(bin.value)"
                    class="textColor SecondaryBGColor"
                    style="width: 30%; border-color: white; border-width: 1px"
                  />
                </div>
              </form>
              <button
                class="btn btn-outline-light textColor"
                (click)="setDefaultYrange()"
              >
                set default yrange
              </button>
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
    </div>
  `,
})
export class SinglePlotSetting {
  plusIcon = faCirclePlus;
  deleteIcon = faTrashAlt;

  _setting?: IplotSingle;
  tagListAll: string[] = [];
  yrangeList: IdefaultYranges = {};

  constructor(public activeModal: NgbActiveModal) {}

  set setting(data: IplotSingle) {
    this._setting = data;
  }

  get setting(): IplotSingle {
    return this._setting!;
  }

  onSelectPlotTag(tag: string) {
    this.setting.tag = tag;
    this.setting.yrange = {
      min: this.yrangeList[tag].min,
      max: this.yrangeList[tag].max,
    };
  }

  setYrangeMin(val: string) {
    this.setting.yrange!.min = Number(val);
  }

  setYrangeMax(val: string) {
    this.setting.yrange!.max = Number(val);
  }

  setDefaultYrange() {
    this.setting.yrange = {
      min: this.yrangeList[this.setting.tag].min,
      max: this.yrangeList[this.setting.tag].max,
    };
  }

  setBin(bin: string) {
    const end = this.yrangeList[this.setting.tag].max;
    const start = this.yrangeList[this.setting.tag].min;
    const size = (end - start) / Number(bin);

    this.setting.xbin = {
      end: end,
      size: size,
      start: start,
    };
    this.setting.bin = Number(bin);
  }
}
