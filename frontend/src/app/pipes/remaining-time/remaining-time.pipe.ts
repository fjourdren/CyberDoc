import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import countdown from 'src/app/countdownjs';
import { forkJoin } from 'rxjs';

@Pipe({
  name: 'remainingTime',
})
export class RemainingTimePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer, translate: TranslateService) {
    forkJoin([
      translate.get('countdownjs.singular'),
      translate.get('countdownjs.plural'),
      translate.get('countdownjs.last'),
      translate.get('countdownjs.delim'),
      translate.get('countdownjs.empty'),
    ])
      .toPromise()
      .then((strings) => {
        countdown.setLabels(
          strings[0],
          strings[1],
          strings[2],
          strings[3],
          strings[4],
          undefined,
          undefined,
        );
      });
  }

  transform(value: number): string {
    const refDate = new Date();
    const startDate = new Date(refDate);
    const endDate = new Date(refDate);
    endDate.setSeconds(endDate.getSeconds() + value);

    const result = countdown(
      startDate,
      endDate,
      countdown.DEFAULTS,
      undefined,
      undefined,
    );
    return this.sanitizer.bypassSecurityTrustHtml(result.toHTML()) as string;
  }
}
