import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../../services/photo.service';

@Component({
  selector: 'app-main',
  templateUrl: 'main.page.html',
  styleUrls: ['main.page.scss']
})
export class MainPage implements OnInit {

  constructor(public photoService: PhotoService) {}

  ngOnInit() {
    this.photoService
      .carregarFotosDosArquivos();
  }
}
