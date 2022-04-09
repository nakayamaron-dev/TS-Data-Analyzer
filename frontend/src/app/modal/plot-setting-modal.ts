import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Imodal } from '../visualizer/visualizer.component';

@Component({
    template:
    `
    <div class="row">
        <div class="col-4" *ngFor="let tag of setting.setting.tagList; index as j">
            <label class="col-11">tag{{ j+1 }}</label>
            <select 
            #tagSelect class="form-select" (change)="onSelectPlotTag(tagSelect.value, j)">
                <option 
                *ngFor="let tag of setting.tagListAll"
                [selected]="tag === setting.setting.tagList[j]">{{tag}}</option>
            </select>
        </div>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-outline-dark" (click)="activeModal.close(setting)">Close</button>
    </div>
    `
})

export class PlotSetting implements OnInit{
    _setting: any;

    constructor(public activeModal: NgbActiveModal) { }

    set setting(data: Imodal) {
        this._setting = data;
    }
    get setting(): Imodal {
        return this._setting;
    }

    onSelectPlotTag(tag: string, idx: number) {
        this.setting.setting.tagList[idx] = tag;
    }

    ngOnInit(): void { }
}