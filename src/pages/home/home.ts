import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { EncryptType } from '../../components/database/database';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  db1;
  db2;

  constructor(public navCtrl: NavController) {
    this.db1 = {
      name: 'AES_encrypted_db',
      encryptType: EncryptType.AES
    };

    this.db2 = {
      name: 'NONE_encrypted_db',
      encryptType: EncryptType.NONE
    };
  }
}

