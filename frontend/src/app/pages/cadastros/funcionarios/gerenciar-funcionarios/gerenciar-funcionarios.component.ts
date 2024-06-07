import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-gerenciar-funcionarios',
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
    MatSelectModule,
  ],
  templateUrl: './gerenciar-funcionarios.component.html',
  styleUrl: './gerenciar-funcionarios.component.css'
})
export class GerenciarFuncionariosComponent {
  constructor(
    public modal: MatDialogRef<GerenciarFuncionariosComponent>) {}

  onNoClick(): void {
    this.modal.close();
  }
}
