import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {FileTag, NO_DATEDIFF_DEFAULT, NO_TYPE_FILTER, SearchParams} from 'src/app/models/files-api-models';
import {AppUtilsService} from 'src/app/services/app-utils/app-utils.service';
import {FilesUtilsService, FileType} from 'src/app/services/files-utils/files-utils.service';
import {UserServiceProvider} from 'src/app/services/users/user-service-provider';

@Component({
    selector: 'app-files-filter-toolbar',
    templateUrl: './files-filter-toolbar.component.html',
    styleUrls: ['./files-filter-toolbar.component.css']
})
export class FilesFilterToolbarComponent {

    private _searchParams: SearchParams;
    tags: FileTag[] = [];

    get searchParams() {
        return this._searchParams;
    }

    @Input() set searchParams(val: SearchParams) {
        this._searchParams = val;

        this.tags = [];
        for (const tag of this.userServiceProvider.default().getActiveUser().tags) {
            if (val.tagIDs.indexOf(tag._id) !== -1) {
                this.tags.push(tag);
            }
        }
    }

    constructor(private userServiceProvider: UserServiceProvider,
                private appUtis: AppUtilsService,
                private router: Router,
                private filesUtils: FilesUtilsService) {
    }

    getIconForFileType(type: string): string {
        return this.filesUtils.getFontAwesomeIcon(FileType[type]);
    }

    getTranslationForFileType(type: string): string {
        return this.filesUtils.fileTypeToString(FileType[type]);
    }

    getTranslationForDateDiff(dateDiff: number): string {
        return `datediff.${dateDiff}`;
    }

    computeTextColor(hexColor: string): string {
        return this.appUtis.computeTextColor(hexColor);
    }

    isTypeFilterUsed(searchParams: SearchParams): boolean {
        return searchParams.type !== NO_TYPE_FILTER;
    }

    isDateDiffFilterUser(searchParams: SearchParams): boolean {
        return searchParams.dateDiff !== NO_DATEDIFF_DEFAULT;
    }

    removeTypeFilter(): void {
        this.searchParams.type = NO_TYPE_FILTER;
        this.router.navigate(['/files-search', JSON.stringify(this.searchParams)]);
    }

    removeDateDiffFilter(): void {
        this.searchParams.dateDiff = NO_DATEDIFF_DEFAULT;
        this.router.navigate(['/files-search', JSON.stringify(this.searchParams)]);
    }

    removeTagFilter(tagID: string): void {
        this.searchParams.tagIDs = this.searchParams.tagIDs.filter(val => val !== tagID);
        this.router.navigate(['/files-search', JSON.stringify(this.searchParams)]);
    }
}
