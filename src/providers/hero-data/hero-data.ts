import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {AngularFireOfflineDatabase} from "angularfire2-offline";
import {Subscription} from "rxjs/Subscription";
import {Network} from "@ionic-native/network";
import {AlertController, Events, ToastController} from "ionic-angular";
import {Http} from "@angular/http";
import {statsEndpoint} from "../../app/AppConfigs";

export interface Hero {
    Group: string,
    ImageURL: string,
    PrimaryName: string,
    SubGroup: string,
    Universe: string,
}

@Injectable()
export class HeroDataProvider {
  devMode:boolean = false;

  showStats:boolean = statsEndpoint !== null;

  SelectedHeroInfo:Hero = {
    Group: '',
    ImageURL: 'assets/imgs/rand.png',
    PrimaryName: 'Pull down to Randomize!',
    SubGroup: '',
    Universe: '',
  };

  currentHeroStats:{
    gamesPlayed: string,
    gamesBanned: string,
    popularityPercentage: string,
    winPercentage: string
  } = {
    gamesPlayed: 'N/A',
    gamesBanned: 'N/A',
    popularityPercentage: 'N/A',
    winPercentage: 'N/A'
  };

  heroGroupsStates = [
    {name:"Warrior", enabled: true},
    {name:"Specialist", enabled: true},
    {name:"Assassin", enabled:true},
    {name:"Support", enabled:true},
  ];
  heroSubGroupsStates = [
    {name:"Utility", enabled:true},
    {name:"Tank", enabled:true},
    {name:"Ambusher", enabled:true},
    {name:"Bruiser", enabled:true},
    {name:"Healer", enabled:true},
    {name:"Siege", enabled:true},
    {name:"Sustained Damage", enabled:true},
    {name:"Burst Damage", enabled:true},
    {name:"Helper", enabled:true},
  ];
  heroUniverseStates = [
    {name:"Warcraft", enabled:true},
    {name:"Diablo", enabled:true},
    {name:"Starcraft", enabled:true},
    {name:"Overwatch", enabled:true},
    {name:"Blizzard", enabled:true},
  ];

  networkConnected:boolean = false;

  MasterHeroList:Hero[] = [];
  UsableHeroList:Hero[] = [];
  HeroListSubscription:Subscription;

  constructor(public http:Http, public fireDB:AngularFireOfflineDatabase, private network: Network,public alertCtrl:AlertController, public toastCtrl:ToastController, public appEvents:Events) {
    //this.devMode = true;

    if(!this.devMode) {
      if (this.network.type) {
        this.networkConnected = !(this.network.type.localeCompare('unknown') === 0 || this.network.type.localeCompare('none') === 0);
      } else {
        this.networkConnected = false;
      }
    } else {
      this.networkConnected = true;
    }
    this.network.onDisconnect().subscribe(() => {
      this.networkConnected = false;
      this.HeroListSubscription.unsubscribe();
    });
    this.network.onConnect().subscribe(() => {
      this.networkConnected = true;
      this.setupHeroListSubscription();
    });
    this.setupHeroListSubscription();
    setTimeout(() => {
      if(this.MasterHeroList.length < 1){
        //alert to connect to internet to retrieve hero list.
        this.alertCtrl.create({
          title: 'Error',
          message: 'No list could be loaded please connect to the internet to update local data.',
          buttons: ['Okay'],
        }).present();
      }
    }, 3000);
  }

  async doRollOnPull(refresher){
    // call and wait for the getRandomHero function to finish before we complete the spinner
    await this.selectRandomHero();
    // hide the spinner as all is complete.
    refresher.complete();
  }

  setupHeroListSubscription(){
    this.HeroListSubscription = this.fireDB.list('/Heroes').subscribe((data:Hero[]) => {
      this.MasterHeroList = data.slice();
      let tempList = [];

      this.MasterHeroList.map((hero:Hero) => {
        if(tempList.indexOf(hero.SubGroup) === -1){
          tempList.push(hero.SubGroup);
        }
      });
      console.log(tempList);
      this.filterHeroList();
    });
  }

  resetFilters(){
    this.heroGroupsStates.map((item) => {
      item.enabled = true;
    });
    this.heroSubGroupsStates.map((item) => {
      item.enabled = true;
    });
    this.heroUniverseStates.map((item) => {
      item.enabled = true;
    });
    this.filterHeroList();
  }

  filterHeroList(){
    //apply filters to master list then set the list that randomize uses to filtered list
    let filteredList = [];
    let filterOnValues = [];

    //the following 3 map calls are to generate what keys we can filter the master List on.
    this.heroGroupsStates.map((item) => {
      if(item.enabled){
        filterOnValues.push(item.name)
      }
    });
    this.heroSubGroupsStates.map((item) => {
      if(item.enabled){
        filterOnValues.push(item.name)
      }
    });
    this.heroUniverseStates.map((item) => {
      if(item.enabled){
        filterOnValues.push(item.name)
      }
    });

    //iterate over the master hero list and check if each hero should be in the pool
    this.MasterHeroList.map((hero) => {
      //a heroes Group(Role), SubGroup(SubRole), and Universe must be in the available keys in-order to be eligible to be in the pool
      if(filterOnValues.indexOf(hero.Group) > -1 && filterOnValues.indexOf(hero.SubGroup) > -1 && filterOnValues.indexOf(hero.Universe) > -1){
        //copy the hero object into the filtered list, we do a copy so we dont end up with a pointer to the value in
        //master list so if something happens to master list our filtered list wont be affected.
        filteredList.push(Object.assign({}, hero));
      }
    });
    //set the class prop to a copy of the local filtered list var so we have access to it elsewhere in the class.
    this.UsableHeroList = filteredList.slice();
    //create the 'Toast' for the heroes available at the bottom of the app.
    let t = this.toastCtrl.create({
      message: `${this.UsableHeroList.length} heroes available!`,
      duration: 3000,
      position: 'top'
    });
    //show the toast... now im hungry...
    t.present();
  }

  private static randIntBetween(min:number, max:number){
    return Math.floor(Math.random() * (max+1)) + min
  }

  private rollingPause(time:number){
    return new Promise((resolve, reject) => {
      setTimeout(function(){resolve();}, time);
    });
  }

  private async getHeroStatsFromHotsLogs(heroName){
    let currentHeroStats:{
      gamesPlayed: string,
      gamesBanned: string,
      popularityPercentage: string,
      winPercentage: string
    };
    try {
      if(statsEndpoint !== null) {
        let res = await this.http.get(`${statsEndpoint}/${heroName}`).toPromise();
        let data = res.json();
        if (data.gamesPlayed) {
          // hero exists on the list so we use the returned data for its stats.
          currentHeroStats = res.json();
        } else {
          // couldnt get the heroes stats, either it does not exist or more likely hasnt been added to the apps list yet
          currentHeroStats = {
            gamesPlayed: 'N/A',
            gamesBanned: 'N/A',
            popularityPercentage: 'N/A',
            winPercentage: 'N/A',
          };
        }
      } else {
        currentHeroStats = {
          gamesPlayed: 'NYI',
          gamesBanned: 'NYI',
          popularityPercentage: 'NYI',
          winPercentage: 'NYI',
        };
      }
    } catch(e){
      // there was an error connecting to the server so we just return a default N/A so we rid of the "Loading..."
      currentHeroStats = {
        gamesPlayed: 'N/A',
        gamesBanned: 'N/A',
        popularityPercentage: 'N/A',
        winPercentage: 'N/A',
      };
    }
    return currentHeroStats;
  }

  async selectRandomHero(){
    this.SelectedHeroInfo = {
      Group: '',
      ImageURL: 'assets/imgs/rand.png',
      PrimaryName: 'Selecting Hero...',
      SubGroup: '',
      Universe: '',
    };
    this.currentHeroStats = {
      gamesPlayed: 'Rolling...',
      gamesBanned: 'Rolling...',
      popularityPercentage: 'Rolling...',
      winPercentage: 'Rolling...'
    };
    await this.rollingPause(350); //dramatic pause!
    let selectedHero:Hero = this.UsableHeroList[HeroDataProvider.randIntBetween(0, this.UsableHeroList.length - 1)];
    let th = Object.assign({}, selectedHero);
    let statsFromHL = await this.getHeroStatsFromHotsLogs(th.ImageURL);
    if(this.networkConnected)
      th.ImageURL = `http://d1i1jxrdh2kvwy.cloudfront.net/Images/Heroes/Portraits/${selectedHero.ImageURL}.png`;
    else
      th.ImageURL = 'assets/imgs/rand.png';
    //fire event for stats
    this.SelectedHeroInfo = Object.assign({}, th);
    this.currentHeroStats = Object.assign({}, statsFromHL);
    this.appEvents.publish('heroRolled', selectedHero);
  }


}
