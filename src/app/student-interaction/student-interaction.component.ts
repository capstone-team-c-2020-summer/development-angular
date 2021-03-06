import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ApiService} from '../api.service';

@Component({
  selector: 'app-student-interaction',
  templateUrl: './student-interaction.component.html',
  styleUrls: ['./student-interaction.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class StudentInteractionComponent implements OnInit {

  isPhoto = false;  // true if student profile picture exists
  interactionData;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.getInteractionData().subscribe(data => {
      console.log(data);  // for debugging
      this.interactionData = data;
    });
  }

}
