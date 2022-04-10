import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Igraph } from '../visualizer/visualizer.component';
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
                <div class="col-2" *ngFor="let tag of setting.tagList; index as i">
                    <label class="col-10">tag{{ i+1 }}</label>
                    <fa-icon class="col-2 PrimaryColor" [icon]="deleteIcon" size="lg" (click)="removeTag(i)"></fa-icon>
                    <select 
                    #tagSelect class="form-select"
                    (change)="onSelectPlotTag(tagSelect.value, i)">
                        <option 
                        *ngFor="let tag of tagListAll"
                        [selected]="tag === setting.tagList[i]">{{tag}}</option>
                    </select>
                    <label>min:</label>
                    <input #yrangeMin type="text" [value]="setting.yrange[i][0]" (input)="setYrangeMin(yrangeMin.value, i)">
                    <br>
                    <label>max:</label>
                    <input #yrangeMax type="text" [value]="setting.yrange[i][1]" (input)="setYrangeMax(yrangeMax.value, i)">
                </div>
                <fa-icon *ngIf="setting.tagList.length < 6" class="col-1 PrimaryColor" [icon]="plusIcon" size="2x" (click)="addTag()"></fa-icon>
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
    setting: Igraph = {
        _id: 0,
        tagList: [],
        yrange: [[0, 0]],
    };
    tagListAll: string[] = [];

    constructor(public activeModal: NgbActiveModal) { }

    onSelectPlotTag(tag: string, idx: number) {
        this.setting.tagList[idx] = tag;
    }

    addTag() {
        this.setting.tagList.push(this.setting.tagList[0])
        this.setting.yrange.push(this.setting.yrange[0])
    }

    removeTag(idx: number) {
        this.setting.tagList.splice(idx, 1);
        this.setting.yrange.splice(idx, 1);
    }

    setYrangeMin(val: string, idx: number) {
        this.setting.yrange[idx][0] = Number(val);
    }

    setYrangeMax(val: string, idx: number) {
        this.setting.yrange[idx][1] = Number(val);
    }
}