import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IplotScatter } from '../scatter/scatter.component'; 
import { faCirclePlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { IdefaultYranges } from '../service/influx.service';

@Component({
    template:
    `
    <div class="SecondaryBGColor">
        <div class="modal-header">
            <h4 class="textColor">Graph Settings</h4>
        </div>
        <div class="card SecondaryBGColor">
            <div class="card-body">
                <div class="row">
                    <div class="col-6">
                        <select 
                        #tagXSelect class="form-select textColor SecondaryBGColor"
                        (change)="onSelectPlotTagX(tagXSelect.value)">
                            <option 
                            *ngFor="let tag of tagListAll"
                            [selected]="tag === setting.tag_x">{{tag}}</option>
                        </select>
                        <br>
                        <form>
                        <div class="mb-3">
                            <label class="textColor">Xaxis min</label>
                            <br>
                            <input #xrangeMin type="text" [value]="setting.xrange?.min" 
                            (input)="setTagXrangeMin(xrangeMin.value)" class="textColor SecondaryBGColor" 
                            style="width: 75%; border-color: white; border-width: 1px">
                        </div>
                        <div class="mb-3">
                            <label class="textColor">Xaxis max</label>
                            <br>
                            <input #xrangeMax type="text" [value]="setting.xrange?.max" 
                            (input)="setTagXrangeMax(xrangeMax.value)" class="textColor SecondaryBGColor" 
                            style="width: 75%; border-color: white; border-width: 1px">
                        </div>
                        </form>
                    </div>
                    <div class="col-6">
                        <select 
                        #tagYSelect class="form-select textColor SecondaryBGColor"
                        (change)="onSelectPlotTagY(tagYSelect.value)">
                            <option 
                            *ngFor="let tag of tagListAll"
                            [selected]="tag === setting.tag_y">{{tag}}</option>
                        </select>
                        <br>
                        <form>
                        <div class="mb-3">
                            <label class="textColor">Yaxis min</label>
                            <br>
                            <input #yrangeMin type="text" [value]="setting.yrange?.min" 
                            (input)="setTagYrangeMin(yrangeMin.value)" class="textColor SecondaryBGColor" 
                            style="width: 75%; border-color: white; border-width: 1px">
                        </div>
                        <div class="mb-3">
                            <label class="textColor">Yaxis max</label>
                            <br>
                            <input #yrangeMax type="text" [value]="setting.yrange?.max" 
                            (input)="setTagYrangeMax(yrangeMax.value)" class="textColor SecondaryBGColor" 
                            style="width: 75%; border-color: white; border-width: 1px">
                        </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline-light textColor SecondaryBGColor" (click)="activeModal.close(setting)">Update</button>
        </div>
    </div>
    `
})

export class ScatterSetting {
    plusIcon = faCirclePlus;
    deleteIcon = faTrashAlt;

    _setting?: IplotScatter;
    tagListAll: string[] = [];
    yrangeList: IdefaultYranges = {};

    constructor(public activeModal: NgbActiveModal) { }

    set setting(data: IplotScatter) {
        this._setting = data;
    }

    get setting(): IplotScatter {
        return this._setting!
    }

    onSelectPlotTagX(tag: string) {
        this.setting.tag_x = tag;
        this.setting.xrange! = {
            min: this.yrangeList[tag].min,
            max: this.yrangeList[tag].max,
        }
    }

    onSelectPlotTagY(tag: string) {
        this.setting.tag_y = tag;
        this.setting.yrange! = {
            min: this.yrangeList[tag].min,
            max: this.yrangeList[tag].max,
        }
    }

    setTagYrangeMin(val: string) {
        this.setting.yrange!.min = Number(val);
    }

    setTagYrangeMax(val: string) {
        this.setting.yrange!.max = Number(val);
    }

    setTagXrangeMin(val: string) {
        this.setting.xrange!.min = Number(val);
    }

    setTagXrangeMax(val: string) {
        this.setting.xrange!.max = Number(val);
    }
}