import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {HeroDataProvider} from "../../providers/hero-data/hero-data";
import {AccountProvider} from "../../providers/account/account";

@Component({
  selector: 'page-randomizer',
  templateUrl: 'randomizer.html',
})
export class RandomizerPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public HeroService:HeroDataProvider, public Account:AccountProvider) {
  }



}
