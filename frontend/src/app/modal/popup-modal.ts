import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  template: `
    <div class="SecondaryBGColor">
      <div class="modal-header">
        <h4 class="modal-title textColor">{{ title }}</h4>
      </div>
      <div class="modal-body">
        <p class="textColor">{{ message }}</p>
      </div>
      <div class="modal-footer">
        <button
          class="btn btn-outline-light textColor"
          (click)="activeModal.close('ok')"
        >
          {{ okCaption }}
        </button>
        <button
          *ngIf="showCancel"
          class="btn btn-outline-light textColor"
          (click)="activeModal.dismiss('cancel')"
        >
          {{ cancelCaption }}
        </button>
      </div>
    </div>
  `,
})
export class PopUp {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() okCaption = 'OK';
  @Input() cancelCaption = 'Cancel';
  @Input() showCancel = false;

  constructor(public activeModal: NgbActiveModal) {}
}
