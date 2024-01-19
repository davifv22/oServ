import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderService } from '../../services/header.service';
import { Header } from '../../models/header'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  header:Header

  constructor(private headerService: HeaderService) {
    this.header = {
      nome:'',
      mensagem:'',
      status:''
    }
  }

  ngOnInit(): void {
    this.getData()
  }

  getData(){
    this.headerService.getHeader().subscribe(
      {
        next: (res) => {

          this.header = {
            nome: res.nome,
            mensagem: res.mensagem,
            status: res.status
          }
        },
        error: (err) => console.log('not found')
      }
    )
  }
}
