import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlotSetting } from '../modal/plot-setting-modal';
import { HistSetting } from '../modal/hist-setting-modal';
import { ScatterSetting } from '../modal/scatter-setting-modal';
import { PopUp } from '../modal/popup-modal';
import { IplotMulti } from '../ts-multi/tsmulti.component';
import { IplotHist } from '../histogram/histogram.component';
import { IplotScatter } from '../scatter/scatter.component';
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

  scatterSettingModal(plotInfo: IplotScatter, tagList: string[], yrangeList: IdefaultYranges): Promise<IplotScatter> {
    const modalRef = this.modalService.open(ScatterSetting, { size: 'lg', centered: true });
    const component = modalRef.componentInstance as ScatterSetting;

    if (component != null) {
      component.setting = plotInfo;
      component.tagListAll = tagList;
      component.yrangeList = yrangeList;
    }

    return modalRef.result;
  }

  message(title: string, message: string, okCaption?: string): Promise<boolean> {
    const modalRef = this.modalService.open(PopUp);
    const component = modalRef.componentInstance as PopUp;
    if (component != null) {
      component.title = title;
      component.message = message;
      component.okCaption = okCaption || 'OK';
    }

    return modalRef.result.then((result) => {
      return true;  // はい を押したらこっち
    }, (reason) => {
      return false; // いいえ や x でダイアログを閉じたらこっち
    });
  }
}
