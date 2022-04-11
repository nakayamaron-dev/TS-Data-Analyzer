import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlotSetting } from '../modal/plot-setting-modal';
import { IplotMulti } from '../visualizer/visualizer.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private modalService: NgbModal) { }

  plotSettingModal(plotInfo: IplotMulti, tagList: string[]): Promise<IplotMulti> {
    const modalRef = this.modalService.open(PlotSetting, { size: 'xl', centered: true });
    const component = modalRef.componentInstance as PlotSetting;

    if (component != null) {
      component.setting = plotInfo;
      component.tagListAll = tagList;
    }

    return modalRef.result;
  }
}
