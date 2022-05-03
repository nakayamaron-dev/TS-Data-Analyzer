import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

/**
 * ユーザー確認用Dialog Box
 */
@Component({
  template:
    `
<div class="modal-header SecondaryBGColor">
  <h4 class="modal-title textColor">{{title}}</h4>
</div>
<div class="modal-body SecondaryBGColor">
  <p class="textColor">{{message}}</p>
</div>
<div class="modal-footer SecondaryBGColor">
  <button class="btn btn-outline-light textColor SecondaryBGColor" (click)="activeModal.close('ok')">{{okCaption}}</button>
  <button *ngIf="showCancel" class="btn btn-outline-light textColor SecondaryBGColor" (click)="activeModal.dismiss('cancel')">{{cancelCaption}}</button>
</div>
  `
})
// tslint:disable-next-line:component-class-suffix
export class PopUp {

  @Input() title: string = '';
  @Input() message: string = '';
  @Input() okCaption = 'OK';
  @Input() cancelCaption = 'Cancel';
  @Input() showCancel = false;

  constructor(public activeModal: NgbActiveModal) { }
}