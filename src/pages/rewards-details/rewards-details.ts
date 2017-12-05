import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BASE_URL, BRAND_ID } from '../../config';

// Import Providers.
import { ExceptionHandlerProvider } from '../../providers/exception-handler/exception-handler';
import { AuthProvider } from '../../providers/auth/auth';
import { RewardsProvider } from '../../providers/rewards/rewards';
import { ProfileProvider } from '../../providers/profile/profile';
import { UserdataProvider } from '../../providers/userdata/userdata';
import { LoaderProvider } from '../../providers/loader/loader';
import { AlertProvider } from '../../providers/alert/alert';

@IonicPage()
@Component({
  selector: 'page-rewards-details',
  templateUrl: 'rewards-details.html',
})

export class RewardsDetailsPage {
  @ViewChild('reward') rewardModal;
  @ViewChild('redeemPointsWarning') redeemPointsModal;
  @ViewChild('noPointsWarning') noPointsModal;

  offerdata: any;
  _auth: any;
  _currentPoint: any;
  remainder: any;
  flag: any;
  constructor(private exceptionProvider: ExceptionHandlerProvider,
              private navCtrl: NavController,
              private navParams: NavParams,
              private authProvider: AuthProvider,
              private loaderProvider: LoaderProvider,
              private alertProvider: AlertProvider,
              private userdataProvider:UserdataProvider,
              private rewardsProvider: RewardsProvider,
              private profileProvider:ProfileProvider) {

              this.offerdata = this.navParams.get('data');
              this._auth = localStorage.getItem('auth_token');
  }

  ionViewWillEnter() {

    if (this._auth) {
      this.getCurrentPoints();
      this.authProvider.setHeader();
      if (this.remainder >= 0) {
           this.flag = true;
      }

    }

  }

  navToPurchaseRewards() {

    this.redeemPointsModal.open();

  }

  confirmRedeemVoucher() {

    this.loaderProvider.presentLoadingCustom();
    let redeemData = {

      points: this.offerdata.BrandPointRedeemValue,
      experience_id: this.offerdata.ExperienceID,

    }

    this.closeRedeemPointsModal();
    this.rewardsProvider.redeemVoucher(redeemData).subscribe(data => {
     
      
      if (data[0].code == 200) {

        this.alertProvider.presentToast(data[0].message);

        this.userdataProvider.getMyProfile().subscribe(res => {

           this.loaderProvider.dismissLoader();
          this.authProvider.setUser(res[0].customerdata);
            localStorage.setItem('userdetails', JSON.stringify(res[0].customerdata));
            this.authProvider.setHeader();          
            this.navCtrl.push("PurchaseRewardsPage", { 'offerData': this.offerdata });
          
        }, err => {
           this.loaderProvider.dismissLoader();
        });
        

      } else {
         this.loaderProvider.dismissLoader();
        this.alertProvider.presentToast(data[0].message);

      }

    }, err => {

        this.closeRedeemPointsModal();
        this.loaderProvider.dismissLoader();
        this.exceptionProvider.excpHandler(err)
    });
  }

  closeRedeemPointsModal() {

    this.redeemPointsModal.close();
    
  }

  getCurrentPoints() {
    
      this._currentPoint = this.authProvider.getMyCurrentPoints();
      this.remainder = this._currentPoint - this.offerdata.BrandPointRedeemValue;
  }
}
