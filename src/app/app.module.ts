import {NgModule, ErrorHandler, enableProdMode} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { TabsPage } from '../pages/tabs/tabs';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {RandomizerPage} from "../pages/randomizer/randomizer";
import { HeroDataProvider } from '../providers/hero-data/hero-data';
import {NativeStorage} from "@ionic-native/native-storage";
import {AngularFireOfflineModule} from "angularfire2-offline";
import {AngularFireModule} from "angularfire2";
import {AngularFireDatabaseModule} from "angularfire2/database";
import {AngularFireAuthModule} from "angularfire2/auth";
import {Network} from "@ionic-native/network";
import {FiltersPage} from "../pages/filters/filters";
import {ProfilePage} from "../pages/profile/profile";
import { AccountProvider } from '../providers/account/account';
import {SecureStorage} from "@ionic-native/secure-storage";
import {SignUpPage} from "../pages/sign-up/sign-up";
import {StatsPage} from "../pages/stats/stats";
import {ProfileEditPage} from "../pages/profile-edit/profile-edit";
import {HttpModule} from "@angular/http";
import {LegalPage} from "../pages/legal/legal";
import {firebaseConfig} from "./AppConfigs";

enableProdMode();

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    RandomizerPage,
    FiltersPage,
    ProfilePage,
    SignUpPage,
    StatsPage,
    ProfileEditPage,
    LegalPage
  ],
  imports: [
    BrowserModule,
    AngularFireDatabaseModule,
    AngularFireOfflineModule,
    AngularFireAuthModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    RandomizerPage,
    FiltersPage,
    ProfilePage,
    SignUpPage,
    StatsPage,
    ProfileEditPage,
    LegalPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    HeroDataProvider,
    NativeStorage,
    Network,
    SecureStorage,
    AccountProvider
  ]
})
export class AppModule {}
