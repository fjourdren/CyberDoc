import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrls: ['./main-screen.component.scss']
})
export class MainScreenComponent implements OnInit {

  constructor(private changeSS: ChangeDetectorRef, private breakpointObserver: BreakpointObserver, private aa: ActivatedRoute     ) { 
    this.breakpointObserver.observe('(max-width: 1000px)').subscribe(result=>{
      this.isSmallScreen = result.matches;
    })
    this.breakpointObserver.observe('(max-width: 1500px)').subscribe(result=>{
      this.otherSS = result.matches;
    })

    aa.paramMap.subscribe((val)=>{
      if (val.has("dirID")){
        this.aaa = val.get("dirID");
        this.changeSS.markForCheck();

      }
    });

  }

  isSmallScreen = this.breakpointObserver.isMatched('(max-width: 1000px)');
  otherSS = this.breakpointObserver.isMatched('(max-width: 1500px)');
  
  _aaa: string;
  bbb: string;
  _directoryID: string;
  fileID: string;

  get aaa(){
    return this._aaa;
  }

  set aaa(val: string){
    this._aaa = val;
    history.pushState({}, null,  `/drive/${val}`);
  }

  get directoryID(){
    return this._directoryID;
  }

  set directoryID(val: string) {
    console.log(val);
    this._directoryID = val;
    this.changeSS.markForCheck();
  }

  ngOnInit(): void {
  }

  a(obj){
    console.log(obj);
  }

}
