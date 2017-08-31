import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {HeroDataProvider} from "../../providers/hero-data/hero-data";

@Component({
  selector: 'page-filters',
  templateUrl: 'filters.html',
})
export class FiltersPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public HeroService:HeroDataProvider) {
  }

}
