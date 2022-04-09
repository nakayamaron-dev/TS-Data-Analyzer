import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlotSetting } from '../modal/plot-setting-modal';
import { Imodal } from '../visualizer/visualizer.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private modalService: NgbModal) { }

  plotSettingModal(args: Imodal): Promise<Imodal> {
    const modalRef = this.modalService.open(PlotSetting, { size: 'lg', centered: true });
    const component = modalRef.componentInstance as PlotSetting;

    if (component != null) {
      component.setting = args;
    }

    return modalRef.result;
  }
}
