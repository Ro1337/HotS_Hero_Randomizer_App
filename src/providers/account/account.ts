import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {AngularFireOfflineDatabase} from "angularfire2-offline";
import {AngularFireAuth} from "angularfire2/auth";
import {FirebaseError, User} from "firebase/app";
import {AlertController, Events, LoadingController} from "ionic-angular";
import {Hero} from "../hero-data/hero-data";
import {Subscription} from "rxjs/Subscription";

export interface ProfileData {
  Created: string,
  Nickname: string,
  HoTSLogsId: string,
}

export interface UserData{
  Profile: ProfileData,
  RandomStats: {
    GroupsData: {
      [key:string]: number,
    },
    SubGroupsData: {
      [key:string]: number,
    },
    TotalRandomed: number,
    UniverseData: {
      [key:string]: number,
    },
    IndividualHerosData: {
      [key:string]: number,
    } | null,
  }
}

@Injectable()
export class AccountProvider {

  uid:string | null = null;

  currentUser:UserData | null = null;
  groupsKeys:string[] = [];
  subGroupsKeys:string[] = [];
  uniKeys:string[] = [];
  heroKeys:string[] = [];

  //store the subscription to the users data like the nickname so when it changes we can update the ui, and so when the user logs out
  //we can unsubscribe from the data.
  userDataSub:Subscription;

  constructor(public fireDB:AngularFireOfflineDatabase, public fireAuth:AngularFireAuth, public appEvents:Events, public alertCtrl:AlertController, public loadingCtrl:LoadingController) {
    this.fireAuth.auth.setPersistence('local'); // use local persistence so we can maintain the user log in between app restarts/crashes.

    // when the state of our user being authenticated changes we catch the event and handle it here.
    this.fireAuth.auth.onAuthStateChanged((user) => {
      if(this.fireAuth.auth.currentUser !== null){
        // if we have a user in the currentUser object we subscribe to the heroRolled event so we can record stats and
        // we call getUserData() to make sure we have the latest user info.
        if(this.fireAuth.auth.currentUser.emailVerified) {
          this.appEvents.subscribe('heroRolled', (hero)=>{
            this.heroRolled(hero);
          });
          this.getUserData(this.fireAuth.auth.currentUser.uid);
        }
      } else {
        // if we no longer have a currentUser then make sure we are unsubscribed from the heroRolled event as there is no account to record to,
        // and unsubscribed from the userdata, and set uid to null to show the login prompts.
        this.appEvents.unsubscribe('heroRolled');
        this.userDataSub.unsubscribe();
        this.uid = null;
      }
    }, (error:FirebaseError) => {
      console.error(error.message);
    });
  }

  getUserData(uid){
    // set up a subscription to the user info and handle the changes to update the UI.
    this.userDataSub = this.fireDB.object(`/${uid}`).subscribe((data:UserData) => {
      if(!data.RandomStats.IndividualHerosData){
        data.RandomStats.IndividualHerosData = {};
      }
      this.currentUser = data;
      this.groupsKeys = Object.keys(data.RandomStats.GroupsData);
      this.subGroupsKeys = Object.keys(data.RandomStats.SubGroupsData);
      this.uniKeys = Object.keys(data.RandomStats.UniverseData);
      this.heroKeys = data.RandomStats.IndividualHerosData ? Object.keys(data.RandomStats.IndividualHerosData) : [];
      this.uid = uid;
    });
  }

  async signOutOfApp(){
    this.fireAuth.auth.signOut(); // simple call signout and the onAuthStateChanged will catch this and handle us no longer having a currentUser
    this.alertCtrl.create({title:'Goodbye',message:'You have been logged out, I hope you\'ll come back soon :\'( ', buttons:['Farewell']}).present();
  }

  async signInToApp(username:string, password:string){
    let loading = this.loadingCtrl.create({content:'Signing in...'});
    await loading.present();
    this.fireAuth.auth.signInWithEmailAndPassword(username, password).then((u:User) => {
      loading.dismiss();
      if(u.emailVerified){
        this.appEvents.subscribe('heroRolled', (hero)=>{
          this.heroRolled(hero);
        });
        this.getUserData(u.uid);
      } else {
        this.fireAuth.auth.signOut();
        this.alertCtrl.create({title:'Account Not Verified',message:'Your account has not been validated yet, please verify your email then try again.', buttons:['Okay']}).present();
      }
    }).catch((error:FirebaseError) => {
      loading.dismiss();
      this.alertCtrl.create({title:'Error',message:'Invalid credentials, please try again.', buttons:['Okay']}).present();
      console.error(error.message);
    })
  }

  heroRolled(hero:Hero){
    if(this.uid !== null){
      let grp = hero.Group;
      let sgrp = hero.SubGroup;
      let hname = hero.ImageURL.substr(hero.ImageURL.lastIndexOf('/') + 1).replace('.png', '');
      let uni = hero.Universe;
      this.fireDB.object(`/${this.uid}/RandomStats/GroupsData/${grp}`).set(this.currentUser.RandomStats.GroupsData[grp] + 1);
      this.fireDB.object(`/${this.uid}/RandomStats/SubGroupsData/${sgrp}`).set(this.currentUser.RandomStats.SubGroupsData[sgrp] + 1);
      this.fireDB.object(`/${this.uid}/RandomStats/UniverseData/${uni}`).set(this.currentUser.RandomStats.UniverseData[uni] + 1);
      if(!this.currentUser.RandomStats.IndividualHerosData[hname]){
        this.currentUser.RandomStats.IndividualHerosData[hname] = 0;
      }
      this.currentUser.RandomStats.IndividualHerosData[hname] += 1;
      this.fireDB.object(`/${this.uid}/RandomStats/IndividualHerosData`).set(this.currentUser.RandomStats.IndividualHerosData);
      this.fireDB.object(`/${this.uid}/RandomStats/TotalRandomed`).set(this.currentUser.RandomStats.TotalRandomed + 1);
    }
  }

  forgotPassword(emailAddress){
    let l = this.loadingCtrl.create({content:'Sending password reset email...'});
    l.present();
    this.fireAuth.auth.sendPasswordResetEmail(emailAddress).then(() => {
      l.dismiss();
      this.alertCtrl.create({
        title: 'Sent',
        message: 'An email containing instructions to reset your password has been sent!',
        buttons: ['I await it\'s arrival!']
      }).present();
    }).catch((err) => {
      l.dismiss();
      this.alertCtrl.create({
        title: 'Error',
        message: 'Please enter in your valid email address before trying to reset your password.',
        buttons: ['Oops my bad..']
      }).present();
    });
  }

}
