import { Component, OnInit} from '@angular/core'
import { GerenciarClientesComponent } from './gerenciar-clientes/gerenciar-clientes.component'
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component"
import { CommonModule } from '@angular/common'
import { ClientesService } from '../../../services/cadastros/clientes.service'
import { RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { Clientes } from '../../../models/clientes'
import { MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSortModule } from '@angular/material/sort'
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog'
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, SubMenuComponent, RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCardModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  title:string = ''
  Clientes: any = new MatTableDataSource<Clientes>
  paginate: any[] = []
  per_page:number = 0
  search:string = ''
  displayedColumns: string[] = ['idCliente', 'nome', 'telefone', 'email', 'doc', 'endereco', 'cidade', 'dtCadastro', 'situacao', 'detalhes'];

  constructor(private clientesService: ClientesService, public modal: MatDialog) {}

  ngOnInit(): void {
    this.title = 'CLIENTES'
    this.per_page = 20
    this.getClientes(1, this.per_page)
  }

  getClientes(page:number, per_page:number) {
    this.clientesService.getClientes(page, per_page, true).subscribe(data => {
      this.paginate = Object.values(data)
      this.Clientes = new MatTableDataSource(data.results);
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.Clientes.filter = filterValue.trim().toLowerCase();
  }

  openDialog(): void {
    this.modal.open(GerenciarClientesComponent, { });
  }

  perPageSelected() {
    if (this.search !== '') {
      this.Clientes = this.Clientes.filter((cliente: { nome: string }) =>
        cliente.nome.toLowerCase().includes(this.search.toLowerCase())).slice(0, this.per_page)
    } else {
        this.getClientes(1, this.per_page)
      }
    }
}
