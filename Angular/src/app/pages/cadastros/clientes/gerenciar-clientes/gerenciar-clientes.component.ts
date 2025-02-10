import { booleanAttribute, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ClientesService } from '../../../../services/cadastros/clientes.service';
import { Clientes } from '../../../../models/clientes';

@Component({
  selector: 'app-gerenciar-clientes',
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
  templateUrl: './gerenciar-clientes.component.html',
  styleUrl: './gerenciar-clientes.component.css'
})
export class GerenciarClientesComponent {
  data:Clientes

  constructor(public modal: MatDialogRef<GerenciarClientesComponent>, private clientesService: ClientesService) {
    this.data = inject<Clientes>(MAT_DIALOG_DATA);
  }

  Cliente(f: NgForm) {
    const json = {
      nome: f.value['nome'],
      telefone: f.value['telefone'],
      email: f.value['email'],
      doc: f.value['doc'],
      endereco: f.value['endereco'],
      cidade: f.value['cidade'],
      cep: f.value['cep'],
      situacao: booleanAttribute(f.value['situacao']),
      observacao: f.value['observacao'],
      dtCadastro: f.value['dtCadastro'],
    }
    if (this.data == null) {
      this.clientesService.postClientes(json, 0).subscribe(
        (response) => {
          return window.location.reload()
        },
        (error) => {
          return error.message
        }
      )
    } else {
      this.clientesService.postClientes(json, this.data.idCliente).subscribe(
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
