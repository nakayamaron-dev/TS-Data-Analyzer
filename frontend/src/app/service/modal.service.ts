import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlotSetting } from '../modal/plot-setting-modal';
import { Igraph } from '../visualizer/visualizer.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private modalService: NgbModal) { }

  plotSettingModal(plotInfo: Igraph, tagList: string[]): Promise<Igraph> {
    const modalRef = this.modalService.open(PlotSetting, { size: 'xl', centered: true });
    const component = modalRef.componentInstance as PlotSetting;

    if (component != null) {
      component.setting = plotInfo;
      component.tagListAll = tagList;
    }

    return modalRef.result;
  }
}
