import { Component } from '@angular/core';
import {AlertController, LoadingController, NavController, NavParams} from 'ionic-angular';
import {AngularFireAuth} from "angularfire2/auth";
import {FirebaseError, User} from "firebase/app";
import {AngularFireOfflineDatabase} from "angularfire2-offline";
import {HeroDataProvider} from "../../providers/hero-data/hero-data";
import * as moment from 'moment';

@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html',
})
export class SignUpPage {

  email_address:string = '';
  password_phrase:string = '';
  password_phrase2:string = '';

  constructor(public HeroService:HeroDataProvider, public navCtrl: NavController, public navParams: NavParams, public firAuth:AngularFireAuth, public alertCtrl:AlertController, public loadingCtrl:LoadingController, public fireDB:AngularFireOfflineDatabase) {}

  sendSignup(){
    let loading = this.loadingCtrl.create({content: 'Signing up...'});
    loading.present();
    if(this.email_address.length > 0 && this.password_phrase.length > 0 && this.password_phrase2.length > 0) {
      if (this.password_phrase.localeCompare(this.password_phrase2) === 0) {
        //console.log(this.firAuth.auth);
        this.firAuth.auth.createUserWithEmailAndPassword(this.email_address, this.password_phrase).then((user: User) => {
          user.sendEmailVerification();
          let obj = {
            GroupsData: {},
            SubGroupsData: {},
            UniverseData: {},
            TotalRandomed: 0,
          };
          this.HeroService.heroGroupsStates.map((item) => {
            obj.GroupsData[item.name] = 0;
          });
          this.HeroService.heroSubGroupsStates.map((item) => {
            obj.SubGroupsData[item.name] = 0;
          });
          this.HeroService.heroUniverseStates.map((item) => {
            obj.UniverseData[item.name] = 0;
          });
          this.fireDB.object(`${user.uid}/RandomStats`).set(obj);
          this.fireDB.object(`${user.uid}/Profile`).set({
            Nickname: this.email_address,
            Created: moment().format('YYYY-MM-DD'),
          });
          loading.dismiss();
          this.alertCtrl.create({
            title: 'Success',
            message: 'An email has been sent to you to verify your email address. You will be able to log in once verified.',
            buttons: ['Awesome!']
          }).present();
          this.navCtrl.pop();
        }, (error: FirebaseError) => {
          loading.dismiss();
          this.alertCtrl.create({
            title: 'Error, Please Try Again',
            message: error.message,
            buttons: ["Dang, I'll try again."]
          }).present();
        });
      } else {
        loading.dismiss();
        this.alertCtrl.create({
          title: 'Error, Please Try Again',
          message: 'The password fields do not match.',
          buttons: ["Dang, I'll try again."]
        }).present();
      }
    } else {
      loading.dismiss();
      this.alertCtrl.create({
        title: 'Error, Please Try Again',
        message: 'All fields must be filled in.',
        buttons: ['Oops, sorry.']
      }).present();
    }
  }

}
