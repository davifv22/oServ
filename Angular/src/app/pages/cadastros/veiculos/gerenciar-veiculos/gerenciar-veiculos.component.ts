import { booleanAttribute, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { VeiculosService } from '../../../../services/cadastros/veiculos.service';
import { Veiculos } from '../../../../models/veiculos';

@Component({
  selector: 'app-gerenciar-veiculos',
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
  templateUrl: './gerenciar-veiculos.component.html',
  styleUrl: './gerenciar-veiculos.component.css'
})
export class GerenciarVeiculosComponent {
    data:Veiculos

    constructor(public modal: MatDialogRef<GerenciarVeiculosComponent>, private veiculosService: VeiculosService) {
      this.data = inject<Veiculos>(MAT_DIALOG_DATA);
    }

    Veiculo(f: NgForm) {
      const json = {
        modelo: f.value['modelo'],
        marca: f.value['marca'],
        placa: f.value['placa'],
        kmRodados: f.value['kmRodados'],
        idEquipe: parseInt(f.value['idEquipe']),
        situacao: booleanAttribute(f.value['situacao'])
      }
      if (this.data == null) {
        this.veiculosService.postVeiculo(json, 0).subscribe(
          (response) => {
            return window.location.reload()
          },
          (error) => {
            return error.message
          }
        )
      } else {
        this.veiculosService.postVeiculo(json, this.data.idVeiculo).subscribe(
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
