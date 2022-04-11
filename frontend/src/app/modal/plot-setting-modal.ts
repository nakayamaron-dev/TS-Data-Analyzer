import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IplotMulti } from '../visualizer/visualizer.component';
import { faCirclePlus, faTrash } from '@fortawesome/free-solid-svg-icons';

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
        <button type="button" class="btn btn-outline-dark" (click)="activeModal.close(setting)">Close</button>
    </div>
    `
})

export class PlotSetting {
    plusIcon = faCirclePlus;
    deleteIcon = faTrash;


    tagListAll: string[] = [];
    _setting?: IplotMulti;

    constructor(public activeModal: NgbActiveModal) { }

    set setting(data: IplotMulti) {
        this._setting = data;
    }

    get setting(): IplotMulti {
        return this._setting!
    }

    onSelectPlotTag(tag: string, idx: number) {
        this.setting.items[idx].tag = tag;
    }

    addTag() {
        this.setting.items.push(
            {
                tag: this.tagListAll[0],
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
}