import { booleanAttribute, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TipoRequerimentoService } from '../../../../services/cadastros/tipo-requerimento.service';
import { TipoRequerimento } from '../../../../models/tipo-requerimento';

@Component({
  selector: 'app-gerenciar-tipo-requerimento',
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
  templateUrl: './gerenciar-tipo-requerimento.component.html',
  styleUrl: './gerenciar-tipo-requerimento.component.css'
})
export class GerenciarTipoRequerimentoComponent {
  data:TipoRequerimento

  constructor(public modal: MatDialogRef<GerenciarTipoRequerimentoComponent>, private tipoRequerimentoService: TipoRequerimentoService) {
      this.data = inject<TipoRequerimento>(MAT_DIALOG_DATA);
    }

    TipoRequerimento(f: NgForm) {
      const json = {
        descricao: f.value['descricao'],
        emiteOrcamento: booleanAttribute(f.value['emiteOrcamento']),
        emiteOS: booleanAttribute(f.value['emiteOS']),
        situacao: booleanAttribute(f.value['situacao'])
      }
      if (this.data == null) {
        this.tipoRequerimentoService.postTipoRequerimento(json, 0).subscribe(
          (response) => {
            return window.location.reload()
          },
          (error) => {
            return error.message
          }
        )
      } else {
        this.tipoRequerimentoService.postTipoRequerimento(json, this.data.idTipoRequerimento).subscribe(
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
