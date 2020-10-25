import {AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CloudDirectory} from 'src/app/models/files-api-models';
import {FileSystemProvider} from 'src/app/services/filesystems/file-system-provider';
import {FilesNewFolderDialogComponent} from '../files-new-folder-dialog/files-new-folder-dialog.component';
import {UserServiceProvider} from "../../../services/users/user-service-provider";

@Component({
    selector: 'app-files-upload',
    templateUrl: './files-upload.component.html',
    styleUrls: ['./files-upload.component.scss']
})
export class FilesUploadComponent implements AfterViewInit {

    @Input() currentDirectory: CloudDirectory;
    @ViewChild('dropDiv') dropDiv: ElementRef<HTMLDivElement>;
    @ViewChild('file') input: ElementRef<HTMLInputElement>;

    showDragZone = false;
    setTimeoutID: number;
    currentlyUploading = false;

    constructor(
        private fsProvider: FileSystemProvider,
        private userServiceProvider: UserServiceProvider,
        private dialog: MatDialog
    ) {
        fsProvider.default().getCurrentFileUpload().subscribe(val => {
            this.currentlyUploading = (val != undefined);
        })
    }

    @HostListener('document:dragover', ['$event'])
    onDragOver(evt: DragEvent) {
        if (this.currentlyUploading || this.currentDirectory._id === this.userServiceProvider.default().getActiveUser().sharedFilesDirectoryId) return;

        evt.preventDefault();
        evt.stopPropagation();
        this.showDragZone = true;
        window.clearTimeout(this.setTimeoutID);
        this.setTimeoutID = window.setTimeout(() => this.showDragZone = false, 250);
    }

    @HostListener('document:drop', ['$event'])
    onDrop(evt: DragEvent) {
        if (this.currentlyUploading || this.currentDirectory._id === this.userServiceProvider.default().getActiveUser().sharedFilesDirectoryId) return;

        evt.preventDefault();
        evt.stopPropagation();
        this.showDragZone = false;
        if (evt.dataTransfer.files.length === 1) {
            this.uploadSelectedFile(evt.dataTransfer.files[0]);
        }
    }

    uploadSelectedFile(file: File) {
        if (this.currentDirectory._id === this.userServiceProvider.default().getActiveUser().sharedFilesDirectoryId) {
            // TODO : Recursive call to disable this action in every single subdirectory
            alert('You can\'t upload a file in "Shared with me"')
        } else {
            this.fsProvider.default().startFileUpload(
                file,
                this.currentDirectory
            );
        }
    }

    ngAfterViewInit(): void {
        this.input.nativeElement.addEventListener("change", (e) => {
            if (this.input.nativeElement.files.length === 1) {
                this.uploadSelectedFile(this.input.nativeElement.files[0]);
            }
        })
    }

    uploadFile() {
        this.input.nativeElement.click();
    }

    createFolder() {
        if (this.currentDirectory._id === this.userServiceProvider.default().getActiveUser().sharedFilesDirectoryId) {
            // TODO : Recursive call to disable this action in every single subdirectory
            alert('You can\'t create a directory in "Shared with me"')
        } else {
            this.dialog.open(FilesNewFolderDialogComponent, {
                maxWidth: "400px",
                data: this.currentDirectory
            });
        }
    }
}
