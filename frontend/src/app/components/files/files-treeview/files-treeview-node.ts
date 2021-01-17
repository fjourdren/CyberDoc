import { CloudDirectory } from 'src/app/models/files-api-models';

export class FilesTreeviewNode {
  constructor(
    public directory: CloudDirectory,
    public level = 0,
    public parents: FilesTreeviewNode[],
    public expandable: boolean = true,
    public selected: boolean = false,
    public bin: boolean = false,
  ) {}
}
