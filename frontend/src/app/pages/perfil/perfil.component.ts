import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [SubMenuComponent, CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  title:string = ''

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.title = 'PERFIL'
  }


  previewUrl: string | ArrayBuffer | null = null;

onFileSelected(event: any) {
  const file: File = event.target.files[0];
  const reader = new FileReader();

  // if (file) {
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   this.http.post('http://localhost:3000/api/upload', formData).subscribe(
  //     (response) => {
  //       console.log(response);
  //     },
  //     (error) => {
  //       console.error('Erro ao enviar o arquivo:', error);
  //     }
  //   );
  // }

  reader.onload = (e: any) => {
    this.previewUrl = e.target.result;
  };

  reader.readAsDataURL(file);
}



}
