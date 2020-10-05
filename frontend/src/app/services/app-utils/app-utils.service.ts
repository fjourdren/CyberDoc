import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppUtilsService {

  constructor() { }

  computeTextColor(hexBackgroundColor: string) {
    hexBackgroundColor = hexBackgroundColor.substring(1, 7); //remove # 
    const hRed = parseInt(hexBackgroundColor.substring(0, 2), 16);
    const hGreen = parseInt(hexBackgroundColor.substring(2, 4), 16);
    const hBlue = parseInt(hexBackgroundColor.substring(4, 6), 16);
    const cBrightness = ((hRed * 299) + (hGreen * 587) + (hBlue * 114)) / 1000;

    return (cBrightness > 130) ? "#000000" : "#ffffff"
  }
}
