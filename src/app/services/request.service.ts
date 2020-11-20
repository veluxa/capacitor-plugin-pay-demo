import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders, HttpEventType, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { map, filter, catchError } from 'rxjs/operators';
import { Observable, throwError, of, observable } from 'rxjs';
import { NavController, LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { IBaseDto } from '../interfaces/order';


@Injectable({
    providedIn: "root",
})
export class RequestService {
    ws: WebSocket;
    ws$: Observable<any>;
    private actionBaseUrl = environment.apiUrlBase;

    getHeaders(jsonContent = true): HttpHeaders {
        const token = localStorage.getItem("token");
        const httpHeaders = new HttpHeaders({ Authorization: `Bearer ${token}` });
        if (jsonContent) {
            httpHeaders.append('content-type', 'application/json');
        }
        return httpHeaders;
    }

    constructor(
        private http: HttpClient,
        private navCtrl: NavController,
        private loadingController: LoadingController,
    ) { }
    get baseUrl() {
        return this.actionBaseUrl;
    }

    request(url: string, data: any, method = 'POST', notJsonContent = false, reportProgress = false): Observable<any> {
        reportProgress = reportProgress || notJsonContent;
        const req = new HttpRequest(method, this.actionBaseUrl + url, data, { reportProgress, headers: this.getHeaders(!notJsonContent) });
        return this.http.request(req).pipe(catchError((res: HttpErrorResponse) => {
            if (res.status === 401) {
                console.warn("token过期或者未登录");
            } else if ([500, 415].indexOf(res.status) > -1) {
                console.error("服务器出错：", res);
            }
            return throwError(res);
        }), map((event: HttpResponse<any>) => {
            if (!reportProgress && event.type !== HttpEventType.Response) {
                return null;
            }
            return event;
        }), filter((value) => value != null));
    }
    async fetch(url: string, data: object, method = 'POST'): Promise<any> {
        const loading = await this.loadingController.create({ message: '请稍候' });
        await loading.present();
        return new Promise((resolve, reject) => {
            this.request(url, data, method).subscribe({
                next: (res: HttpResponse<any>) => {
                    loading.dismiss();
                    if (res.body.result) {
                        resolve(res.body);
                    } else {
                        reject(res.body.err);
                    }
                },
                error: (res: any) => {
                    loading.dismiss();
                    if (res.status !== 401) {
                        reject(res.err ? res.err : '服务器出现错误，请稍候再试。');
                    } else {
                        console.log('登录超时或未登录：', res);
                    }
                }
            });
        });
    }

    private requestOptions: any = {
        headers: { "content-type": "application/json" },
    };

    get token() {
        return localStorage.getItem("token");
    }
    set token(value: string) {
        localStorage.setItem("token", value);
    }

    get name() {
        return localStorage.getItem("name");
    }

    set name(value: string) {
        localStorage.setItem("name", value);
    }

    post<T>(
        url: string,
        param: any,
        requestOptions?: any
    ): Promise<T & IBaseDto> {
        return new Promise((resolve, reject) => {
            if (!requestOptions) {
                requestOptions = this.requestOptions;
            }
            if (this.token) {
                requestOptions.headers.Authorization = `Bearer ${this.token}`;
            }
            this.http
                .post(`${environment.apiUrlBase}/${url}`, param, requestOptions)
                .subscribe(
                    (data: object | any) => {
                        resolve(data);
                    },
                    (err) => {
                        console.error(`HttpService.request:${url}`, err);
                        reject(err);
                        // if (err.status === 401) {
                        //   location.href = "/login";
                        // }
                    }
                );
        });
    }
}
