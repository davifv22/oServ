import { Component, OnInit } from '@angular/core';
import { SubMenuComponent } from "../../../components/sub-menu/sub-menu.component";
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user'

@Component({
    selector: 'app-funcionarios',
    standalone: true,
    templateUrl: './funcionarios.component.html',
    styleUrl: './funcionarios.component.css',
    imports: [CommonModule, SubMenuComponent]
})
export class FuncionariosComponent implements OnInit {
  Users: any[] = [];
  title:string = ''

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.title = 'FUNCIONÁRIOS'
    this.getUsuarios();
  }

   getUsuarios(){
    this.userService.getUsers().subscribe(data => {
      this.Users = data;
    }
    )
   }

}
