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
import { EquipesService } from '../../../services/cadastros/equipes.service';
import { Equipes } from '../../../models/equipes';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-equipes',
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
  templateUrl: './equipes.component.html',
  styleUrl: './equipes.component.css',
})
export class EquipesComponent implements OnInit {
  title: string = '';
  Equipes: any = new MatTableDataSource<Equipes>();
  paginate: any[] = [];
  per_page: number = 0;
  search: string = '';
  displayedColumns: string[] = [
    'idEquipe',
    'descricao',
    'idSetor',
    'situacao',
    'detalhes',
  ];

  data: Equipes;

  constructor(
    public modal: MatDialogRef<EquipesComponent>,
    public modal2: MatDialog,
    private equipesService: EquipesService
  ) {
    this.data = inject<Equipes>(MAT_DIALOG_DATA);
  }

  ngOnInit(): void {
    this.title = 'EQUIPES';
    this.per_page = 20;
    this.getEquipes(1, this.per_page);
  }

  getEquipes(page: number, per_page: number) {
    this.equipesService.getEquipes(page, per_page, true).subscribe((dt) => {
      this.paginate = Object.values(dt);
      this.Equipes = new MatTableDataSource(dt.results);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.Equipes.filter = filterValue.trim().toLowerCase();
  }

  Equipe(f: NgForm) {
    const json = {
      descricao: f.value['descricao'],
      idSetor: parseInt(f.value['idSetor']),
      situacao: booleanAttribute(f.value['situacao']),
    };
    if (this.data == null) {
      this.equipesService.postEquipe(json, 0).subscribe(
        (response) => {
          return window.location.reload();
        },
        (error) => {
          return error.message;
        }
      );
    } else {
      this.equipesService.postEquipe(json, this.data.idEquipe).subscribe(
        (response) => {
          return window.location.reload();
        },
        (error) => {
          return error.message;
        }
      );
    }
  }

  open(equipes: Equipes): void {
    if (this.data !== null) {
      if (this.data.idEquipe == equipes.idEquipe) {
        return;
      } else {
        this.modal2.ngOnDestroy();
        this.modal2.open(EquipesComponent, { data: equipes });
      }
    } else {
      this.modal2.open(EquipesComponent, { data: equipes });
    }
  }

  perPageSelected() {
    if (this.search !== '') {
      this.Equipes = this.Equipes.filter((equipe: { descricao: string }) =>
        equipe.descricao.toLowerCase().includes(this.search.toLowerCase())
      ).slice(0, this.per_page);
    } else {
      this.getEquipes(1, this.per_page);
    }
  }
}
