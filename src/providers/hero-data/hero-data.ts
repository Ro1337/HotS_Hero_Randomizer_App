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

  // if a statsEndpoint is not supplied and is left as null then we wont show the stats ui objects at all.
  showStats:boolean = statsEndpoint !== null;

  // holder for the info about the hero which gets selected.
  SelectedHeroInfo:Hero = {
    Group: '',
    ImageURL: 'assets/imgs/rand.png',
    PrimaryName: 'Pull down to Randomize!',
    SubGroup: '',
    Universe: '',
  };

  // hero stats to be displayed under the hero image after selected
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

  // The following 3 arrays are used to hold the state of the toggles on the filter page.
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

  MasterHeroList:Hero[] = []; // array to hold the raw hero list without any filters applied
  UsableHeroList:Hero[] = []; // filtered hero list from which we choose a hero from on roll
  HeroListSubscription:Subscription;

  constructor(public http:Http, public fireDB:AngularFireOfflineDatabase, private network: Network,public alertCtrl:AlertController, public toastCtrl:ToastController, public appEvents:Events) {
    //this.devMode = true; // un-comment this line to by-pass the network check, this is mandatory if you want to test in the dev server ionic serve provides.

    if(!this.devMode) {
      if (this.network.type) {
        // if the network type is unknown or not connected then networkConnected will be false.
        this.networkConnected = !(this.network.type.localeCompare('unknown') === 0 || this.network.type.localeCompare('none') === 0);
      } else {
        this.networkConnected = false;
      }
    } else {
      this.networkConnected = true;
    }

    this.network.onDisconnect().subscribe(() => {
      // this is executed when a network is disconnected.
      this.networkConnected = false;
      this.HeroListSubscription.unsubscribe();
    });

    this.network.onConnect().subscribe(() => {
      // this is executed when a network is connected.
      this.networkConnected = true;
      this.setupHeroListSubscription(); //setup the subscription to the hero list so if there is a change to the available heroes it will be reflected for the user.
    });

    this.setupHeroListSubscription(); //setup the subscription to the hero list so if there is a change to the available heroes it will be reflected for the user.

    // wait 3 seconds after the provider is initalized if there was no hero list loaded tell the user as it means the app wont function.
    // this should only happen if they have never loaded a hero list in the app as we are using angularfire2-offline to cache the database for offline access.
    // it does mean we may have an old list of heroes until they connect to a network again.
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
    // create a subscription to the hero list hosted on firebase so any change will automatically be reflected in the app.
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
    // reset all the filter toggles to on.
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
        //copy the hero object into the filtered list, we do a copy so we don't end up with a pointer to the value in
        //master list so if something happens to master list our filtered list wont be affected and vice versa.
        filteredList.push(Object.assign({}, hero));
      }
    });
    //set the class prop to a copy of the local filtered list var so we have access to it elsewhere in the class.
    this.UsableHeroList = filteredList.slice();
    //create the 'Toast' for the heroes available at the top of the app.
    let t = this.toastCtrl.create({
      message: `${this.UsableHeroList.length} heroes available!`,
      duration: 3000,
      position: 'top'
    });
    //show the toast... now im hungry...
    t.present();
  }

  // simple call for random-ish number
  private static randIntBetween(min:number, max:number){
    return Math.floor(Math.random() * (max+1)) + min
  }

  // pause for dramatic effect
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
        // since we have no endpoint we just set the fields to 'NYI'.
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
    //update the UI to let the user know something is happening.
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

    // if we have a network connection grab the hero protrait and if not then use the image we show while rolling a random
    // hero, this avoids the user seeing a bad looking empty or broken link img tag.
    if(this.networkConnected)
      th.ImageURL = `http://d1i1jxrdh2kvwy.cloudfront.net/Images/Heroes/Portraits/${selectedHero.ImageURL}.png`;
    else
      th.ImageURL = 'assets/imgs/rand.png';

    this.SelectedHeroInfo = Object.assign({}, th);
    this.currentHeroStats = Object.assign({}, statsFromHL);

    // send the event for stats recording, this is caught in the account-provider.
    this.appEvents.publish('heroRolled', selectedHero);
  }


}
