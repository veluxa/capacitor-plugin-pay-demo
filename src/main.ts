import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import {Capacitor} from "@capacitor/core";

if (environment.production) {
  enableProdMode();
}else{
  if (Capacitor.isNative){
    // 如果在原生且调试环境，则打开vconsole
    import('vconsole').then(value => {
      const vConsole = new value.default();
      if (vConsole.$dom.children.length > 0) {
        const dom = vConsole.$dom.children[0];
        dom.classList.add('copy-unable');
        dom.setAttribute('style', 'right: 0px; bottom: 200px;');
      }
    });
  }
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
