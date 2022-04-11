import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IplotMulti } from '../visualizer/visualizer.component';
import { faCirclePlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { IdefaultYranges } from '../service/influx.service';

@Component({
    template:
    `
    <div class="modal-header">
        <h4>Graph Settings</h4>
    </div>
    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-2" *ngFor="let itm of setting.items; index as i">
                    <label class="col-10">tag{{ i+1 }}</label>
                    <fa-icon class="col-2 PrimaryColor" [icon]="deleteIcon" size="lg" (click)="removeTag(i)"></fa-icon>
                    <select 
                    #tagSelect class="form-select"
                    (change)="onSelectPlotTag(tagSelect.value, i)">
                        <option 
                        *ngFor="let tag of tagListAll"
                        [selected]="tag === itm.tag">{{tag}}</option>
                    </select>
                    <button type="button" class="btn" (click)="setDefaultYrange(i)">set default value</button>
                    <br>
                    <label>min:</label>
                    <input #yrangeMin type="text" [value]="itm.yrange?.min" (input)="setYrangeMin(yrangeMin.value, i)">
                    <br>
                    <label>max:</label>
                    <input #yrangeMax type="text" [value]="itm.yrange?.max" (input)="setYrangeMax(yrangeMax.value, i)">
                </div>
                <fa-icon *ngIf="setting.items.length < 6" class="col-1 PrimaryColor" [icon]="plusIcon" size="2x" (click)="addTag()"></fa-icon>
            </div>
        </div>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-outline-dark" (click)="activeModal.close(setting)">Update</button>
    </div>
    `
})

export class PlotSetting {
    plusIcon = faCirclePlus;
    deleteIcon = faTrash;

    _setting?: IplotMulti;
    tagListAll: string[] = [];
    yrangeList: IdefaultYranges = {};

    constructor(public activeModal: NgbActiveModal) { }

    set setting(data: IplotMulti) {
        this._setting = data;
    }

    get setting(): IplotMulti {
        return this._setting!
    }

    onSelectPlotTag(tag: string, idx: number) {
        this.setting.items[idx] = {
            tag: tag,
            yrange: {
                min: this.yrangeList[tag].min,
                max: this.yrangeList[tag].max,
            }
        }
    }

    addTag() {
        this.setting.items.push(
            {
                tag: this.tagListAll[0],
                yrange: {
                    min: this.yrangeList[this.tagListAll[0]].min,
                    max: this.yrangeList[this.tagListAll[0]].max,
                }
            }
        )
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
        }
    }
}