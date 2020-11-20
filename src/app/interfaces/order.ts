export interface IOrder {
    id: number;
    sn: string;
    status: string;
    item: string;
    amount: string;
    time: string;
    wxpayData?: {
        mch_id: string;
        prepay_id: string;
        nonce: string;
        timestamp: string;
        sign: string;
    };
    alipayData?: any;
}


export interface IBaseDto {
    result: boolean;
    err?: string;
}

export interface ILoginDto {
    id: number;
    img: string;
    name: string;
    nickname: string;
    phone: string;
    token: string;
}