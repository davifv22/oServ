import { Component, OnInit} from '@angular/core'
import { GerenciarFuncionariosComponent } from './gerenciar-funcionarios/gerenciar-funcionarios.component'
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component"
import { CommonModule } from '@angular/common'
import { FuncionariosService } from '../../../services/cadastros/funcionarios.service'
import { RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { Funcionarios } from '../../../models/funcionarios'
import { MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSortModule } from '@angular/material/sort'
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog'
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [CommonModule, SubMenuComponent, RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCardModule],
  templateUrl: './funcionarios.component.html',
  styleUrl: './funcionarios.component.css'
})
export class FuncionariosComponent implements OnInit {
  title:string = ''
  Funcionarios: any = new MatTableDataSource<Funcionarios>
  paginate: any[] = []
  per_page:number = 0
  search:string = ''
  displayedColumns: string[] = ['idFuncionario', 'nome', 'idUser', 'idEquipe', 'situacao', 'detalhes'];

  constructor(private funcionariosService: FuncionariosService, public modal: MatDialog) {}

  ngOnInit(): void {
    this.title = 'FUNCIONÁRIOS'
    this.per_page = 20
    this.getFuncionarios(1, this.per_page)
  }

  getFuncionarios(page:number, per_page:number) {
    this.funcionariosService.getFuncionarios(page, per_page, true).subscribe(data => {
      this.paginate = Object.values(data)
      this.Funcionarios = new MatTableDataSource(data.results);
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.Funcionarios.filter = filterValue.trim().toLowerCase();
  }

  openDialog(): void {
    this.modal.open(GerenciarFuncionariosComponent, { });
  }

  perPageSelected() {
    if (this.search !== '') {
      this.Funcionarios = this.Funcionarios.filter((funcionario: { nome: string }) =>
        funcionario.nome.toLowerCase().includes(this.search.toLowerCase())).slice(0, this.per_page)
    } else {
        this.getFuncionarios(1, this.per_page)
      }
    }
}
