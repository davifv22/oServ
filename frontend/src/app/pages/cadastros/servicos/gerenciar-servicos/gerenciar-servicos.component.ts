import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-gerenciar-servicos',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatCardModule,
  ],
  templateUrl: './gerenciar-servicos.component.html',
  styleUrl: './gerenciar-servicos.component.css'
})
export class GerenciarServicosComponent {
  constructor(
    public modal: MatDialogRef<GerenciarServicosComponent>) {}

  onNoClick(): void {
    this.modal.close();
  }
}