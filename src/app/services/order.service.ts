import { Injectable } from "@angular/core";
import { RequestService } from './request.service';
import { AlertService } from './alert.service';
import { throwError } from 'rxjs';
import { IOrder } from '../interfaces/order';


@Injectable({
    providedIn: "root",
})
export class OrderService {

    constructor(
        public request: RequestService,
        public alert: AlertService) { }


    convert2Order(obj: any): IOrder {
        const result: IOrder = {
            id: obj.id,
            sn: obj.out_trade_no,
            status: obj.status,
            item: obj.orderitems && obj.orderitems.length > 0 ? obj.orderitems[0].name : '芯片续费',
            amount: obj.price ? obj.price : 0,
            time: obj.date
        };
        /*
        nonceStr: "c3tpdnlEOgPSz7pL"
orderitems: []
out_trade_no: "160190049620200824115118914"
prepay_id: "wx24115118994229ae3a7f47312e78710000"
price: 1
result: true
sign: "38ae90c22737c4d517d5a8661a06fc6576feec782eab8126cac3894aa62ff9b3"
status: "已支付"
timeStamp: "1598241079"
transaction_id: "4200000707202008240176181256"
上面是详情的
       nonceStr: "O7Xj7sMrSlTY9XcC"
out_trade_no: "160190049620200824115422130"
prepay_id: "wx241154225241216bdc8d0cca506cdf0000"
sign: "68800f437227d7998d2249ad926ab2c5421f5be86925365502ad50f67d5e5fb7"
status: "已支付"
timeStamp: "1598241263"
transaction_id: "4200000716202008246666803030"
*/
        if (obj.partnerid) {
            result.wxpayData = {
                mch_id: obj.partnerid,
                prepay_id: obj.prepay_id,
                nonce: obj.nonceStr,
                timestamp: obj.timeStamp,
                sign: obj.sign
            };
        }
        return result;
    }

    wxPay(productid: string, productName: string, price: number) {
        return this.request.fetch('/Pay/GetWxOrder',
            { tradetype: 'APP', total_fee: price, orderitems: [{ productid, type: productName, count: 1, price }] }
        );
    }
    aliPay(productid: string, productName: string, price: number) {
        return this.request.fetch('/Pay/GetAliOrder',
            { total_fee: price, orderitems: [{ productid, type: productName, count: 1, price }] }
        );
    }
    getOrders(): Promise<IOrder[]> {
        return this.request.fetch('/Pay/GetMyOrders', {}).then((res: { orders: any[] }) => {
            return res.orders.map(o => this.convert2Order(o));
        }).catch((err) => {
            this.alert.alert(err);
            throw new Error(err);
        });
    }

    /*
    alibody: null
date: "2020-08-21 15:55:26"
id: 27
nonceStr: "HJHtSgWNgrpJgDBd"
orderitems: []
out_trade_no: "160190049620200821155525600"
prepay_id: "wx21155526250880368090118705e9760000"
price: 100
result: true
sign: "6C174CB76416F62A4020F2357E1D19AA"
status: "已关闭"
timeStamp: "1597996526"
transaction_id: nul */

    getOrder(id: number) {
        return this.request.fetch('/Pay/GetOrder', { id }).then((res) => {
            return this.convert2Order(res);
        });
    }
    cancelOrder(id): Promise<any> {
        return this.request.fetch('/Pay/CloseOrder', { id });
    }
    deleteOrder(id): Promise<any> {
        return this.request.fetch('/Pay/DeleteOrder', { id });
    }
}
