import { booleanAttribute, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FuncionariosService } from '../../../../services/cadastros/funcionarios.service';
import { Funcionarios } from '../../../../models/funcionarios';

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
    CommonModule,
  ],
  templateUrl: './gerenciar-funcionarios.component.html',
  styleUrl: './gerenciar-funcionarios.component.css'
})
export class GerenciarFuncionariosComponent {
  data:Funcionarios

  constructor(public modal: MatDialogRef<GerenciarFuncionariosComponent>, private funcionariosService: FuncionariosService) {
    this.data = inject<Funcionarios>(MAT_DIALOG_DATA);
  }

  Funcionario(f: NgForm) {
    const json = {
      idUser : parseInt(f.value['idUser']),
      nome: f.value['nome'],
      idEquipe: parseInt(f.value['idEquipe']),
      situacao: booleanAttribute(f.value['situacao'])
    }
    if (this.data == null) {
      this.funcionariosService.postFuncionario(json, 0).subscribe(
        (response) => {
          return window.location.reload()
        },
        (error) => {
          return error.message
        }
      )
    } else {
      this.funcionariosService.postFuncionario(json, this.data.idFuncionario).subscribe(
        (response) => {
          return window.location.reload()
        },
        (error) => {
          return error.message
        }
      )
    }
  }

  onNoClick(): void {
    this.modal.close();
  }
}
