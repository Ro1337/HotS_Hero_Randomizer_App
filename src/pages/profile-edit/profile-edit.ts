import { Component } from '@angular/core';
import {AlertController, NavController, NavParams} from 'ionic-angular';
import {AccountProvider} from "../../providers/account/account";
import {AngularFireOfflineDatabase} from "angularfire2-offline";

export interface ProfileDataShown {
  Nickname: string,
  HoTSLogsId: string,
}


@Component({
  selector: 'page-profile-edit',
  templateUrl: 'profile-edit.html',
})
export class ProfileEditPage {

  ProfileLoaded:ProfileDataShown = {
    Nickname: '',
    HoTSLogsId: '',
  };

  ProfileKeys:string[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public Account:AccountProvider, public fireDB:AngularFireOfflineDatabase, public alertCtrl:AlertController) {}

  ionViewDidEnter(){
    this.ProfileLoaded = {
      Nickname: this.Account.currentUser.Profile.Nickname ? this.Account.currentUser.Profile.Nickname : '',
      HoTSLogsId: this.Account.currentUser.Profile.HoTSLogsId ? this.Account.currentUser.Profile.HoTSLogsId : '',
    };
    this.ProfileKeys = Object.keys(this.ProfileLoaded);
  }

  saveProfile(){
    this.ProfileKeys.map((item) => {
      this.fireDB.object(`/${this.Account.uid}/Profile/${item}`).set(this.ProfileLoaded[item]);
    });
    this.alertCtrl.create({title:'Success', message:'Profile updated successfully!', buttons:['Woo Hoo!']}).present();
    this.navCtrl.pop();
  }

}
