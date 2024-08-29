import { Component, OnInit} from '@angular/core'
import { GerenciarVeiculosComponent } from './gerenciar-veiculos/gerenciar-veiculos.component'
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component"
import { CommonModule } from '@angular/common'
import { VeiculosService } from '../../../services/cadastros/veiculos.service'
import { RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { Veiculos } from '../../../models/veiculos'
import { MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSortModule } from '@angular/material/sort'
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog'
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, SubMenuComponent, RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCardModule],
  templateUrl: './veiculos.component.html',
  styleUrl: './veiculos.component.css'
})
export class VeiculosComponent implements OnInit {
  title:string = ''
  Veiculos: any = new MatTableDataSource<Veiculos>
  paginate: any[] = []
  per_page:number = 0
  search:string = ''
  displayedColumns: string[] = ['idVeiculo', 'modelo', 'marca', 'placa', 'kmRodados', 'idEquipe', 'situacao', 'detalhes'];

  constructor(private veiculosService: VeiculosService, public modal: MatDialog) {}

  ngOnInit(): void {
    this.title = 'VEÍCULOS'
    this.per_page = 20
    this.getVeiculos(1, this.per_page)
  }

  getVeiculos(page:number, per_page:number) {
    this.veiculosService.getVeiculos(page, per_page, true).subscribe(data => {
      this.paginate = Object.values(data)
      this.Veiculos = new MatTableDataSource(data.results);
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.Veiculos.filter = filterValue.trim().toLowerCase();
  }

  openDialog(veiculo: Veiculos): void {
    if (veiculo.idVeiculo > 0) {
      this.modal.open(GerenciarVeiculosComponent, { data:veiculo });
    } else {
      this.modal.open(GerenciarVeiculosComponent, { });
    }
  }

  perPageSelected() {
    if (this.search !== '') {
      this.Veiculos = this.Veiculos.filter((veiculo: { idVeiculos: string }) =>
        veiculo.idVeiculos.toLowerCase().includes(this.search.toLowerCase())).slice(0, this.per_page)
    } else {
        this.getVeiculos(1, this.per_page)
      }
    }
}
