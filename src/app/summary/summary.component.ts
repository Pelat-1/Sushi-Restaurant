import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalComponent } from '../modal/modal.component';
import { OptionalIngredient } from '../shared/optional-ingredient';
import { Order } from '../shared/order';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css', '../menu-item/menu-item.component.css']
})
export class SummaryComponent implements OnInit {
  @Input()
  orderArray: Order[];
  @Output()
  orderEmit: EventEmitter<Order[]> = new EventEmitter();

  private modalDialogConfig: MatDialogConfig<Order> = {
    width: '30em',
    height: '35em',
    autoFocus: false
  };

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    for (let j = 0; j < this.orderArray.length; j++) {
      for (let k = j + 1; k < this.orderArray.length; k++) {
        if (this.orderArray[j].equals(this.orderArray[k], true)) {
          this.orderArray[j].quantity += this.orderArray[k].quantity;
          this.orderArray.splice(k, 1);
          k--;
        }
      }
    }
    this.emit();
  }

  plus1(index: number): void {
    this.orderArray[index].quantity += 1;
    this.emit();
  }

  minus1(index: number): void {
    if (this.orderArray[index].quantity > 0) {
      this.orderArray[index].quantity -= 1;
    } else {
      this.orderArray.splice(index, 1);
    }
    this.emit();
  }

  openModalDialog(order: Order): void {
    this.modalDialogConfig.data = order;
    const modalDialogRef = this.dialog.open(ModalComponent, this.modalDialogConfig);
    modalDialogRef.afterClosed().subscribe((result: Order) => {
      if (result) {
        order.ingredients = result.ingredients;
        order.description = '';
        order.ingredients.forEach((optIngr: OptionalIngredient, index: number) => {
          if (!optIngr.equals(order.recipe.optionalIngredients[index], true)) {
            order.description += ', ';
            order.description += optIngr.checked ? 'CON ' : 'NO ';
            order.description += optIngr.ingredient.noteName;
          }
        });
        order.description = order.description.substr(2);
      }
    });
  }

  note(note: string, index: number): void {
    this.orderArray[index].description = note;
    const order: Order = new Order(this.orderArray[index].recipe);
    let nopush = false;
    this.orderArray.forEach((element: Order) => {
      if (element.equals(order, true)) {
        nopush = true;
        return;
      }
    });
    if (!nopush) {
      this.orderArray.push(order);
    }
    this.emit();
  }

  private emit(): void {
    this.orderEmit.emit(this.orderArray);
  }
}
