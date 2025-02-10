import { Component, OnInit} from '@angular/core'
import { GerenciarServicosComponent } from './gerenciar-servicos/gerenciar-servicos.component'
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component"
import { CommonModule } from '@angular/common'
import { ServicosService } from '../../../services/cadastros/servicos.service'
import { RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { Servicos } from '../../../models/servicos'
import { MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSortModule } from '@angular/material/sort'
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog'
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, SubMenuComponent, RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCardModule],
  templateUrl: './servicos.component.html',
  styleUrl: './servicos.component.css'
})
export class ServicosComponent implements OnInit {
  title:string = ''
  Servicos: any = new MatTableDataSource<Servicos>
  paginate: any[] = []
  per_page:number = 0
  search:string = ''
  displayedColumns: string[] = ['idServico', 'descricao', 'tipo', 'valor', 'situacao', 'detalhes'];

  constructor(private servicoService: ServicosService, public modal: MatDialog) {}

  ngOnInit(): void {
    this.title = 'SERVIÇOS'
    this.per_page = 20
    this.getServicos(1, this.per_page)
  }

  getServicos(page:number, per_page:number) {
    this.servicoService.getServicos(page, per_page, true).subscribe(data => {
      this.paginate = Object.values(data)
      this.Servicos = new MatTableDataSource(data.results);
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.Servicos.filter = filterValue.trim().toLowerCase();
  }

  openDialog(servico: Servicos): void {
    if (servico.idServico > 0) {
      this.modal.open(GerenciarServicosComponent, { data:servico });
    } else {
      this.modal.open(GerenciarServicosComponent, { });
    }
  }

  perPageSelected() {
    if (this.search !== '') {
      this.Servicos = this.Servicos.filter((servico: { descricao: string }) =>
        servico.descricao.toLowerCase().includes(this.search.toLowerCase())).slice(0, this.per_page)
    } else {
        this.getServicos(1, this.per_page)
      }
    }
}
