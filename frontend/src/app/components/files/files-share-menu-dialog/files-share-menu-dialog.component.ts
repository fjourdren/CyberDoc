import {  Component, ElementRef, HostListener, Inject, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { CloudNode, RespondShare } from 'src/app/models/files-api-models';
import { User } from 'src/app/models/users-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
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
  styleUrls: ['./files-share-menu-dialog.component.css']
})
export class FilesShareMenuDialogComponent implements OnInit {

  loading = false;
  //input = new FormControl('', [Validators.required, Validators.email]);
  //rank = new FormControl('state', [Validators.required]);

  displayedColumns: string[] = ['email', 'name', 'delete'];
  //dataSource: RespondShare[];
  dataSource = new MatTableDataSource([]);

  @ViewChild('inputElement') inputElement: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<FilesShareMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public node: CloudNode,
    private fsProvider: FileSystemProvider,
    private dialog: MatDialog) {
      
      fsProvider.default().getUserShared(node.id).toPromise().then((value)=>{
        this.dataSource.data = value;
      });
      console.log(this.dataSource);
      fsProvider.default().refreshNeeded().subscribe(()=>{
        this.update();
      });
  }
  
  update(){
    console.log("In update");
    this.fsProvider.default().getUserShared(this.node.id).toPromise().then((value)=>{
      this.dataSource.data = value;
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
    this.fsProvider.default().share(this.node.id, email).toPromise().then(() => {
      this.loading = false;    
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
