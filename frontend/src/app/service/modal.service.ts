import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlotSetting } from '../modal/plot-setting-modal';
import { HistSetting } from '../modal/hist-setting-modal';
import { IplotMulti } from '../visualizer/visualizer.component';
import { IplotHist } from '../histogram/histogram.component';
import { IdefaultYranges } from './influx.service';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private modalService: NgbModal) { }

  plotSettingModal(plotInfo: IplotMulti, tagList: string[], yrangeList: IdefaultYranges): Promise<IplotMulti> {
    const modalRef = this.modalService.open(PlotSetting, { size: 'xl', centered: true });
    const component = modalRef.componentInstance as PlotSetting;

    if (component != null) {
      component.setting = plotInfo;
      component.tagListAll = tagList;
      component.yrangeList = yrangeList;
    }

    return modalRef.result;
  }

  histSettingModal(plotInfo: IplotHist, tagList: string[], yrangeList: IdefaultYranges): Promise<IplotHist> {
    const modalRef = this.modalService.open(HistSetting, { size: 'md', centered: true });
    const component = modalRef.componentInstance as HistSetting;

    if (component != null) {
      component.setting = plotInfo;
      component.tagListAll = tagList;
      component.yrangeList = yrangeList;
    }

    return modalRef.result;
  }
}
