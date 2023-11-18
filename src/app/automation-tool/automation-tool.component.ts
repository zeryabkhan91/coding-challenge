import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { STEPENUM } from '../constants';
import { predictedElementsForSelected } from '../helpers/automation-helper';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-automation-tool',
  templateUrl: './automation-tool.component.html',
  styleUrls: ['./automation-tool.component.css']
})
export class AutomationToolComponent {

  readonly STEPS_DETAILS = STEPENUM;
  populateTextControl = new FormControl('');
  activeStep: STEPENUM = STEPENUM.ELEMENT_SELECTION;
  previouseSelectedStep: STEPENUM | undefined;
  private selectedElements: Set<HTMLElement> = new Set<HTMLElement>();
  private predictedElements: Set<HTMLElement> = new Set<HTMLElement>();

  constructor(private renderer: Renderer2, private elRef: ElementRef, private snackbar: MatSnackBar) {}

  get isElementSelection(): boolean {
    return this.activeStep === STEPENUM.ELEMENT_SELECTION;
  }

  get selectedElementsLength(): number {
    return this.selectedElements.size;
  }

  get predictedElementsLength(): number {
    return this.predictedElements.size;
  }

  get isResetAllowed(): boolean {
    return this.activeStep !== STEPENUM.ELEMENT_SELECTION &&
      this.activeStep !== STEPENUM.BOT_RUN_COMPLETED;
  }

  get selectedAndPredictedElements(): HTMLElement[] {
    return [...this.selectedElements.values(), ...this.predictedElements.values()]
  }

  private isAutomationElement(el: HTMLElement) {
    return this.elRef.nativeElement.contains(el);
  }

  private selectOrUnSelectElement(el: HTMLElement): void {
    if (this.selectedElements.delete(el)) {
      this.renderer.removeClass(el, 'isSelected');
    } else {
      this.selectedElements.add(el);
      this.renderer.addClass(el, 'isSelected');
    }
  }

  private stopEventAndPredict = (e: MouseEvent) => {
    e.stopImmediatePropagation();

    this.selectOrUnSelectElement(e.target as HTMLElement);

    const predictedElements = predictedElementsForSelected(this.selectedElements);

    this.predictedElements.forEach(el => this.renderer.removeClass(el, 'isPredicted'));
    this.predictedElements.clear();

    predictedElements.forEach(el => this.predictedElements.add(el));

    this.predictedElements.forEach(el => this.renderer.addClass(el, 'isPredicted'));
  };

  private showSnackbar(message: string): void {
    this.snackbar.open(message, 'Dismiss', {
      duration: 3000, 
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  moveToNextStep() {
    if (this.previouseSelectedStep) {
      this.activeStep = this.previouseSelectedStep;
      this.previouseSelectedStep = undefined;
      return
    }

    this.activeStep = STEPENUM.ACTION_SELECTION
  }

  runAutomation(): void {
    this.selectedAndPredictedElements.forEach(el => el.click());

    this.activeStep = STEPENUM.BOT_RUN_COMPLETED;
  }

  resetAutomation(): void {
    this.selectedElements.forEach(el => this.renderer.removeClass(el, 'isSelected'));
    this.predictedElements.forEach(el => this.renderer.removeClass(el, 'isPredicted'));
    this.selectedElements.clear();
    this.predictedElements.clear();

    this.activeStep = STEPENUM.ELEMENT_SELECTION;
  }

  toggleClick(): void {
    if (!this.selectedElementsLength) {
      this.previouseSelectedStep = STEPENUM.ACTION_SELECTION;
      this.activeStep = STEPENUM.ELEMENT_SELECTION;
    } else {
      this.showSnackbar('You have already selected elements. Click on run bot to start automations');
      this.moveToActionSelection();
    }
  }

  toggleInput(): void {
    if (!this.selectedElementsLength) {
      this.previouseSelectedStep = STEPENUM.INPUT_SELECTION;
      this.activeStep = STEPENUM.ELEMENT_SELECTION;
    } else {
      this.activeStep = STEPENUM.INPUT_SELECTION;
    }

  }

  moveToActionSelection(): void {
    this.activeStep = STEPENUM.ACTION_SELECTION;
  }

  populateTextContent(): void {
    const value = this.populateTextControl.value ?? '';

    for (const el of this.selectedAndPredictedElements) {
      this.renderer.setAttribute(el, 'value', value)
    }

    this.activeStep = STEPENUM.BOT_RUN_COMPLETED;
  }
  

  @HostListener('document:mouseover', ['$event'])
  onMouseOver(e: any): void {
    const el: HTMLElement = e.target;

    if (this.isAutomationElement(el) || !this.isElementSelection) {
      return;
    }

    this.renderer.addClass(el, 'isHighlighted');

    el.addEventListener('click', this.stopEventAndPredict, true);
  }

  @HostListener('document:mouseout', ['$event'])
  onMouseOut(e: any): void {
    const el: HTMLElement = e.target;

    if (this.isAutomationElement(el) || !this.isElementSelection) {
      return;
    }

    this.renderer.removeClass(el, 'isHighlighted');
    el.removeEventListener('click', this.stopEventAndPredict, true);
  }

}
