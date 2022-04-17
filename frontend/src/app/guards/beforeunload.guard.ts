import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

export interface OnBeforeunload {
    shouldConfirmOnBeforeunload: () => boolean;
  }
  
  @Injectable()
  export class BeforeunloadGuard implements CanDeactivate<OnBeforeunload> {
    canDeactivate(component: OnBeforeunload) {
      if (component.shouldConfirmOnBeforeunload()) {
        const msg = 'Are you sure you want to leave this page?'
          + '\n The changes you have made may not be saved.';
        return confirm(msg);
      }
      return true;
    }
  }