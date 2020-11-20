import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
    providedIn: "root",
})
export class AlertService {
    constructor(
        private alertController: AlertController,
        private toastController: ToastController
    ) { }

    async toast(message: string) {
        const toast = await this.toastController.create({
            message,
            translucent: true,
            position: 'bottom',
            cssClass: 'my-toast',
            duration: 1660
        });
        toast.present();
    }

    async alert(message: string, onOk: () => void = () => { }) {
        const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: '提示信息',
            message,
            buttons: [
                {
                    text: '我知道了',
                    handler: () => {
                        onOk();
                    }
                }
            ]
        });
        await alert.present();
    }
    async confirm(params: { message: string, onOk: () => void, onCancel?: () => void, header?: string }) {
        const alert = await this.alertController.create({
            header: params.header ? params.header : '提示信息',
            message: params.message,
            buttons: [
                {
                    text: '取消',
                    role: 'cancel',
                    handler: () => {
                        if (typeof params.onCancel === 'function') {
                            params.onCancel();
                        }
                    }
                }, {
                    text: '确定',
                    handler: () => {
                        params.onOk();
                    }
                }
            ]
        });
        await alert.present();
    }

}
