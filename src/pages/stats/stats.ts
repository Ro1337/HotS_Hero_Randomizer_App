import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {AccountProvider} from "../../providers/account/account";

@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html',
})
export class StatsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public Account:AccountProvider) {}

}
