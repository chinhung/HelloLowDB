import { Component, OnInit, Input } from '@angular/core';
import * as low from "lowdb";
import * as LocalStorage from "lowdb/adapters/LocalStorage";
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'database',
  templateUrl: 'database.html'
})
export class DatabaseComponent implements OnInit {

  @Input('name') name: string;
  @Input('encrypt-type') private encryptType: EncryptType;

  private adapterLS: low.AdapterSync<DbSchema>;
  private db;
  private dbDefaultData = {
    posts: [
      { title: "hello", id: 1 },
      { title: "world", id: 2 }
    ],
    user: { id: 1, name: 'John' }
  };

  posts: Post[];
  user: any;

  constructor() {

  }

  ngOnInit() {
    const adapterOptions = LowdbAdapterOptions.getAdapterOptions(this.encryptType);
    this.adapterLS = new LocalStorage<DbSchema>(this.name, adapterOptions);
    this.db = low(this.adapterLS);

    const write: DbSchema = this.db.defaults(this.dbDefaultData).write();

    this.updateView();
  }

  addPost(postTitle: string) {
    let postWithMaxId = this.db.get('posts').maxBy('id').value();
    this.db.get('posts').push({ id: postWithMaxId.id + 1, title: postTitle}).write();
    this.updateView();
  }

  removePost(postId: string) {
    let targetPost = this.db.get('posts').find({ id: Number(postId) }).value();
    if (targetPost) {
      this.db.get('posts').remove({ id: Number(postId) }).write();
      this.updateView();
    } else {
      alert('post not found');
    }
  }

  searchPost(postId: string) {
    let targetPost = this.db.get('posts').find({ id: Number(postId) }).value();
    if (targetPost) {
      alert(`id: ${targetPost.id}, title: ${targetPost.title}`)
    } else {
      alert('post not found');
    }
  }

  updateUserName(userName: string) {
    this.db.get('user').assign({ name: userName}).write();
    this.updateView();
  }

  private updateView() {
    this.posts = this.db.get('posts').value();
    this.user = this.db.get('user').value();
  }

}

export enum EncryptType {
  NONE, AES
}

class LowdbAdapterOptions {

  private static encryptAES: any = {
    serialize: (data: DbSchema) => {
      let str = CryptoJS.AES.encrypt(JSON.stringify(data), 'ioio').toString();
      return str;
    },
      deserialize: (serializedData: string) => {
      let bytes = CryptoJS.AES.decrypt(serializedData, 'ioio');
      let str = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(str);
    }
  };

  private static encryptNONE: any = {
    serialize: (data: DbSchema) => JSON.stringify(data),
    deserialize: (serializedData: string) => JSON.parse(serializedData)
  };

  static getAdapterOptions(encryptType: EncryptType) {
    if (EncryptType.AES === encryptType) {
      return LowdbAdapterOptions.encryptAES;
    } else {
      return LowdbAdapterOptions.encryptNONE;
    }
  }
}


interface DbSchema {
  posts: Array<Post>;
  user: {
    id: number,
    name: string
  };
}

interface Post {
  title?: string;
  views?: number;
  id?: number;
  published?: boolean | undefined;
  tuple?: [boolean, number];
}
