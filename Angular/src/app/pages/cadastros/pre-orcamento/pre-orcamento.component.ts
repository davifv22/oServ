import { Component, OnInit} from '@angular/core'
import { GerenciarPreOrcamentoComponent } from './gerenciar-pre-orcamento/gerenciar-pre-orcamento.component'
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component"
import { CommonModule } from '@angular/common'
import { PreOrcamentoService } from '../../../services/cadastros/pre-orcamento.service'
import { RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { PreOrcamento } from '../../../models/pre-orcamento'
import { MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSortModule } from '@angular/material/sort'
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog'
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-pre-orcamento',
  standalone: true,
  imports: [CommonModule, SubMenuComponent, RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCardModule],
  templateUrl: './pre-orcamento.component.html',
  styleUrl: './pre-orcamento.component.css'
})
export class PreOrcamentoComponent implements OnInit {
  title:string = ''
  PreOrcamentos: any = new MatTableDataSource<PreOrcamento>
  paginate: any[] = []
  per_page:number = 0
  search:string = ''
  displayedColumns: string[] = ['idTipoRequerimento', 'idServico', 'valor', 'detalhes'];

  constructor(private preOrcamentoService: PreOrcamentoService, public modal: MatDialog) {}

  ngOnInit(): void {
    this.title = 'PRÉ-ORÇAMENTO'
    this.per_page = 20
    this.getPreOrcamento(1, this.per_page)
  }

  getPreOrcamento(page:number, per_page:number) {
    this.preOrcamentoService.getPreOrcamento(page, per_page, true).subscribe(data => {
      this.paginate = Object.values(data)
      this.PreOrcamentos = new MatTableDataSource(data.results);
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.PreOrcamentos.filter = filterValue.trim().toLowerCase();
  }

  openDialog(preOrcamento: PreOrcamento): void {
    if (preOrcamento.idTipoRequerimento > 0) {
      this.modal.open(GerenciarPreOrcamentoComponent, { data:preOrcamento });
    } else {
      this.modal.open(GerenciarPreOrcamentoComponent, { });
    }
  }

  perPageSelected() {
    if (this.search !== '') {
      this.PreOrcamentos = this.PreOrcamentos.filter((preOrcamento: { idTipoRequerimento: string }) =>
        preOrcamento.idTipoRequerimento.toLowerCase().includes(this.search.toLowerCase())).slice(0, this.per_page)
    } else {
        this.getPreOrcamento(1, this.per_page)
      }
    }
}
