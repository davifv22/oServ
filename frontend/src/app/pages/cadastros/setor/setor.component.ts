import { booleanAttribute, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SetorService } from '../../../services/cadastros/setor.service';
import { Setor } from '../../../models/setor';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-setor',
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
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
  ],
  templateUrl: './setor.component.html',
  styleUrl: './setor.component.css'
})
export class SetorComponent implements OnInit {
  title: string = ''
  Setor: any = new MatTableDataSource<Setor>
  paginate: any[] = []
  per_page: number = 0
  search: string = ''
  displayedColumns: string[] = ['idSetor', 'descricao', 'situacao', 'detalhes'];

  data: Setor

  constructor(public modal: MatDialogRef<SetorComponent>, public modal2: MatDialog, private setorService: SetorService) {
    this.data = inject<Setor>(MAT_DIALOG_DATA);
  }

  ngOnInit(): void {
    this.title = 'SETORES'
    this.per_page = 20
    this.getSetores(1, this.per_page)
  }

  getSetores(page: number, per_page: number) {
    this.setorService.getSetores(page, per_page, true).subscribe(dt => {
      this.paginate = Object.values(dt)
      this.Setor = new MatTableDataSource(dt.results);
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.Setor.filter = filterValue.trim().toLowerCase();
  }

  gSetor(f: NgForm) {
    const json = {
      descricao: f.value['descricao'],
      situacao: booleanAttribute(f.value['situacao'])
    }
    if (this.data == null) {
      this.setorService.postSetor(json, 0).subscribe(
        (response) => {
          return window.location.reload()
        },
        (error) => {
          return error.message
        }
      )
    } else {
      this.setorService.postSetor(json, this.data.idSetor).subscribe(
        (response) => {
          return window.location.reload()
        },
        (error) => {
          return error.message
        }
      )
    }
  }

  open(setores: Setor): void {
    if (this.data !== null) {
      if (this.data.idSetor == setores.idSetor) {
        return
      } else {
        this.modal2.ngOnDestroy();
        this.modal2.open(SetorComponent, { data: setores });
      }
    } else {
      this.modal2.open(SetorComponent, { data: setores });
    }
  }

  perPageSelected() {
    if (this.search !== '') {
      this.Setor = this.Setor.filter((setor: { descricao: string }) =>
        setor.descricao.toLowerCase().includes(this.search.toLowerCase())).slice(0, this.per_page)
    } else {
      this.getSetores(1, this.per_page)
    }
  }
}
