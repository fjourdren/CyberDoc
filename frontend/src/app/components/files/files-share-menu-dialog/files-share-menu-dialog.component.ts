import {  Component, ElementRef, HostListener, Inject, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { CloudNode, RespondShare } from 'src/app/models/files-api-models';
import { User } from 'src/app/models/users-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';
import { FilesShareDialogComponent } from '../files-share-dialog/files-share-dialog.component';

export interface PeriodicElement {
  id: number;
  name: string;
  mail: string;
  right: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {id:1, mail: "alegal@enssat.fr", name: 'Alexis LE GAL', right: "Read only"},
  {id:2, mail: "cforgeard@enssat.fr", name: 'Clément FORGEARD', right: "Read and write"},
  {id:3, mail: "fjourdren@enssat.fr", name: 'Flavien JOURDREN', right: "Read and write"},
];


@Component({
  selector: 'app-files-share-menu-dialog',
  templateUrl: './files-share-menu-dialog.component.html',
  styleUrls: ['./files-share-menu-dialog.component.scss']
})
export class FilesShareMenuDialogComponent implements OnInit {

  loading = false;
  //input = new FormControl('', [Validators.required, Validators.email]);
  //rank = new FormControl('state', [Validators.required]);

  //Error var :
  genericError = false;

  displayedColumns: string[] = ['email', 'name', 'delete'];
  //dataSource: RespondShare[];
  dataSource = new MatTableDataSource([]);

  @ViewChild('inputElement') inputElement: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<FilesShareMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public node: CloudNode,
    private fsProvider: FileSystemProvider,
    private dialog: MatDialog,
    private userServiceProvider: UserServiceProvider) {
      
      fsProvider.default().getShareWith(node._id).toPromise().then((value)=>{
        this.dataSource.data = value;
      });
      console.log(this.dataSource);
      this.update();
      fsProvider.default().refreshNeeded().subscribe(()=>{
        this.update();
      });
  }
  
  update(){
    console.log("In update");
    this.fsProvider.default().getShareWith(this.node._id).toPromise().then((value)=>{
      console.error(value);
      this.dataSource.data = value;
    }, (error) => {
      this.genericError = true;
    });
  }

  @HostListener("keydown", ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      this.shareNode();
    }
  }

  delete(email: string){
    console.log(email);
    this.loading = true;
    this.fsProvider.default().deleteShare(this.node._id, email).toPromise().then(() => {
      this.loading = false;    
    }, (error) => {
      this.loading = false; 
      this.genericError = true;
    })
  }

  shareNode() {
    this.dialog.open(FilesShareDialogComponent, {
      maxWidth: "800px",
      data: this.node
    });
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }

  ngOnInit() {

  }

}
