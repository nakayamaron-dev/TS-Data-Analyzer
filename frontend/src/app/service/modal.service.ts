import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SinglePlotSetting } from '../modal/single-setting-modal';
import { PlotSetting } from '../modal/plot-setting-modal';
import { HistSetting } from '../modal/hist-setting-modal';
import { ScatterSetting } from '../modal/scatter-setting-modal';
import { PopUp } from '../modal/popup-modal';
import { IplotMulti } from '../ts-multi/tsmulti.component';
import { IplotHist } from '../histogram/histogram.component';
import { IplotScatter } from '../scatter/scatter.component';
import { IplotSingle } from '../ts-single/ts-single.component';
import { IdefaultYranges } from './influx.service';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(private modalService: NgbModal) {}

  singleSettingModal(
    plotInfo: IplotSingle,
    tagList: string[],
    yrangeList: IdefaultYranges
  ): Promise<IplotSingle> {
    const modalRef = this.modalService.open(SinglePlotSetting, {
      size: 'sm',
      centered: true,
    });
    const component = modalRef.componentInstance as SinglePlotSetting;

    if (component != null) {
      component.setting = plotInfo;
      component.tagListAll = tagList;
      component.yrangeList = yrangeList;
    }

    return modalRef.result;
  }

  multiSettingModal(
    plotInfo: IplotMulti,
    tagList: string[],
    yrangeList: IdefaultYranges
  ): Promise<IplotMulti> {
    const modalRef = this.modalService.open(PlotSetting, {
      size: 'xl',
      centered: true,
    });
    const component = modalRef.componentInstance as PlotSetting;

    if (component != null) {
      component.setting = plotInfo;
      component.tagListAll = tagList;
      component.yrangeList = yrangeList;
    }

    return modalRef.result;
  }

  histoSettingModal(
    plotInfo: IplotHist,
    tagList: string[],
    yrangeList: IdefaultYranges
  ): Promise<IplotHist> {
    const modalRef = this.modalService.open(HistSetting, {
      size: 'md',
      centered: true,
    });
    const component = modalRef.componentInstance as HistSetting;

    if (component != null) {
      component.setting = plotInfo;
      component.tagListAll = tagList;
      component.yrangeList = yrangeList;
    }

    return modalRef.result;
  }

  scatterSettingModal(
    plotInfo: IplotScatter,
    tagList: string[],
    yrangeList: IdefaultYranges
  ): Promise<IplotScatter> {
    const modalRef = this.modalService.open(ScatterSetting, {
      size: 'lg',
      centered: true,
    });
    const component = modalRef.componentInstance as ScatterSetting;

    if (component != null) {
      component.setting = plotInfo;
      component.tagListAll = tagList;
      component.yrangeList = yrangeList;
    }

    return modalRef.result;
  }

  message(
    title: string,
    message: string,
    okCaption?: string
  ): Promise<boolean> {
    const modalRef = this.modalService.open(PopUp);
    const component = modalRef.componentInstance as PopUp;
    if (component != null) {
      component.title = title;
      component.message = message;
      component.okCaption = okCaption || 'OK';
    }

    return modalRef.result.then(
      (_) => {
        return true;
      },
      (_) => {
        return false;
      }
    );
  }
}
