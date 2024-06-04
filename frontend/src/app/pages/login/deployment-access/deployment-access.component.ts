import {Component, Inject} from '@angular/core';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule, NgForm} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { ValidationsService } from '../../../services/validations.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-deployment-access',
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
  ],
  templateUrl: './deployment-access.component.html',
  styleUrl: './deployment-access.component.css'
})
export class DeploymentAccessComponent {
  first_access: boolean;

  constructor(public modal: MatDialogRef<DeploymentAccessComponent>, private validationsService: ValidationsService, private router: Router) {
    this.first_access = false;
  }

  onNoClick(): void {
    this.modal.close();
  }

  set_pass(f: NgForm) {
    const json = {
      senha: f.value['senha']
    }
    this.validationsService.init_db(json).subscribe(
        (response) => {
          this.first_access = true;
          return window.location.reload()
        },
        (error) => {
          this.first_access = false;
          return this.router.navigate([''])
        }
    )
  }
}
