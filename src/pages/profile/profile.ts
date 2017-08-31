import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {AccountProvider} from "../../providers/account/account";
import {SignUpPage} from "../sign-up/sign-up";
import {StatsPage} from "../stats/stats";
import {ProfileEditPage} from "../profile-edit/profile-edit";


@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  username:string = '';
  password:string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public Account:AccountProvider) {}

  signIn(){
    this.Account.signInToApp(this.username, this.password);
  }

  gotoSignUp(){
    this.navCtrl.push(SignUpPage);
  }

  goToRandomizerStats(){
    this.navCtrl.push(StatsPage);
  }

  goToProfileEdit(){
    this.navCtrl.push(ProfileEditPage);
  }

}
