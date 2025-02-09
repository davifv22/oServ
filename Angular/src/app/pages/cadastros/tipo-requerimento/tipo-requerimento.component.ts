import { Component, OnInit} from '@angular/core'
import { GerenciarTipoRequerimentoComponent } from './gerenciar-tipo-requerimento/gerenciar-tipo-requerimento.component'
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component"
import { CommonModule } from '@angular/common'
import { TipoRequerimentoService } from '../../../services/cadastros/tipo-requerimento.service'
import { RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { TipoRequerimento } from '../../../models/tipo-requerimento'
import { MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSortModule } from '@angular/material/sort'
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog'
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-tipo-requerimento',
  standalone: true,
  imports: [CommonModule, SubMenuComponent, RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCardModule],
  templateUrl: './tipo-requerimento.component.html',
  styleUrl: './tipo-requerimento.component.css'
})
export class TipoRequerimentoComponent implements OnInit {
  title:string = ''
  TipoRequerimentos: any = new MatTableDataSource<TipoRequerimento>
  paginate: any[] = []
  per_page:number = 0
  search:string = ''
  displayedColumns: string[] = ['idTipoRequerimento', 'descricao', 'emiteOrcamento', 'emiteOS', 'situacao', 'detalhes'];

  constructor(private tipoRequerimentoService: TipoRequerimentoService, public modal: MatDialog) {}

  ngOnInit(): void {
    this.title = 'TIPO DE REQUERIMENTO'
    this.per_page = 20
    this.getTipoRequerimentos(1, this.per_page)
  }

  getTipoRequerimentos(page:number, per_page:number) {
    this.tipoRequerimentoService.getTipoRequerimento(page, per_page, true).subscribe(data => {
      this.paginate = Object.values(data)
      this.TipoRequerimentos = new MatTableDataSource(data.results);
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.TipoRequerimentos.filter = filterValue.trim().toLowerCase();
  }

  openDialog(tipoRequerimento: TipoRequerimento): void {
    if (tipoRequerimento.idTipoRequerimento > 0) {
      this.modal.open(GerenciarTipoRequerimentoComponent, { data:tipoRequerimento });
    } else {
      this.modal.open(GerenciarTipoRequerimentoComponent, { });
    }
  }

  perPageSelected() {
    if (this.search !== '') {
      this.TipoRequerimentos = this.TipoRequerimentos.filter((tipoRequerimento: { idTipoRequerimento: string }) =>
        tipoRequerimento.idTipoRequerimento.toLowerCase().includes(this.search.toLowerCase())).slice(0, this.per_page)
    } else {
        this.getTipoRequerimentos(1, this.per_page)
      }
    }
}
