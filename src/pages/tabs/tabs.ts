import { Component } from '@angular/core';

import {RandomizerPage} from "../randomizer/randomizer";
import {FiltersPage} from "../filters/filters";
import {ProfilePage} from "../profile/profile";
import {LegalPage} from "../legal/legal";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = RandomizerPage;
  tab2Root = FiltersPage;
  tab3Root = ProfilePage;
  tab4Root = LegalPage;

  constructor() {

  }
}
