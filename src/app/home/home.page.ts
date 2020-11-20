import { Component } from '@angular/core';
import { OrderService } from '../services/order.service';
import { ILoginDto } from '../interfaces/order';
import { ToastController } from '@ionic/angular';

import 'capacitor-plugin-pay';
import { Plugins } from '@capacitor/core';
const { Pay } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private service: OrderService,
    private toastController: ToastController
  ) { }

  public name = this.service.request.name;

  async login() {
    const result = await this.service.request.post<ILoginDto>("/User/Login", { phone: "13632640009", pwd: "abcd1234" });
    if (result.result) {
      this.service.request.name = result.nickname;
      this.name = result.nickname;
      this.service.request.token = result.token;
    } else {
      (
        await this.toastController.create({
          message: `${result.err}`,
          position: "top",
          duration: 1500,
        })
      ).present();
    }
  }

  wxpay() {
    this.service.wxPay('1', '芯片续费', 1).then(async (data: any) => {
      const params = {
        mch_id: data.partnerid,
        prepay_id: data.prepayid,
        nonce: data.noncestr,
        timestamp: data.timestamp,
        sign: data.sign
      };
      Pay.wxPayRequest(params).then(res => console.log('wx成功：',res))
        .catch(err => { console.log('wx失败：',err) });
    }).catch(err => this.service.alert.alert(err));
  }

  alipay() {
    this.service.aliPay('55', '芯片续费', 1).then(
      async (data: any) => {
        let orderId = parseInt(data.id, 10);
        const strs = (data.alibody as string).split('&amp;')
        const params = strs.slice(0, strs.length).join('&')

        Pay.aliPayRequest({ orderInfo: params }).then(res => console.log('zfb成功：', res))
          .catch(err => { console.log('zfb失败：', err) });
      }
    ).catch(err => this.service.alert.alert(err));
  }

}

