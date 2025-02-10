import { booleanAttribute, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ServicosService } from '../../../../services/cadastros/servicos.service';
import { Servicos } from '../../../../models/servicos';

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
    MatSelectModule,
    CommonModule,
  ],
  templateUrl: './gerenciar-servicos.component.html',
  styleUrl: './gerenciar-servicos.component.css'
})
export class GerenciarServicosComponent {
  data:Servicos

  constructor(public modal: MatDialogRef<GerenciarServicosComponent>, private servicosService: ServicosService) {
    this.data = inject<Servicos>(MAT_DIALOG_DATA);
  }

  Servico(f: NgForm) {
    const json = {
      descricao: f.value['descricao'],
      tipo: parseInt(f.value['tipo']),
      valor: f.value['valor'],
      situacao: booleanAttribute(f.value['situacao'])
    }
    if (this.data == null) {
      this.servicosService.postServico(json, 0).subscribe(
        (response) => {
          return window.location.reload()
        },
        (error) => {
          return error.message
        }
      )
    } else {
      this.servicosService.postServico(json, this.data.idServico).subscribe(
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
