import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

/**
 * ユーザー確認用Dialog Box
 */
@Component({
  template:
    `
<div class="modal-header">
  <h4 class="modal-title">{{title}}</h4>
</div>
<div class="modal-body">
  <p>{{message}}</p>
</div>
<div class="modal-footer">
  <button type="button" class="btn btn-primary" (click)="activeModal.close('ok')">{{okCaption}}</button>
  <button *ngIf="showCancel" type="button" class="btn btn-outline-dark" (click)="activeModal.dismiss('cancel')">{{cancelCaption}}</button>
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