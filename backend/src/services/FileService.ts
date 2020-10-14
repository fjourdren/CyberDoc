import Guid from 'guid';
import { Types } from 'mongoose';
import MongoClient from 'mongodb'
import { Readable } from 'stream';
import fs from "fs";
import path from 'path';
import sharp from 'sharp'
const filepreview = require('pngenerator');
const libre = require("libreoffice-convert");

import GridFSTalker from "../helpers/GridFSTalker";
import { requireNonNull, requireIsNull } from '../helpers/DataValidation';
import HttpCodes from '../helpers/HttpCodes';
import HTTPError from '../helpers/HTTPError';
import { streamToBuffer } from '../helpers/Conversions';

import IUser from "../models/User";
import { IFile, File, FileType } from "../models/File";

class FileService {
    /**
     * PERMISSIONS FILE HELPERS
     */

    /* === Basic permissions === */
    // check if user is file's owner
    public static async isFileOwner(user_id: string, file_id: string): Promise<boolean> {
        const file: IFile = requireNonNull(await File.findById(file_id).exec());
        return (file.owner_id == user_id);
    }

    public static async requireIsFileOwner(user_id: string, file_id:string): Promise<void> {
        if(!await FileService.isFileOwner(user_id, file_id))
            throw new HTTPError(HttpCodes.UNAUTHORIZED, "User isn't file owner");
    }



    /* === Advanced permissions === */
    /* check if user can view a file
    - if user is owner
    - TODO : if user has been put in share list
    */
    public static async fileCanBeViewed(user_id: string, file_id: string): Promise<boolean> {
        return await this.isFileOwner(user_id, file_id);
    }

    // thrower
    public static requireFileCanBeViewed(user_id: string, file_id: string): void {
        if(!FileService.fileCanBeViewed(user_id, file_id))
            throw new HTTPError(HttpCodes.UNAUTHORIZED, "Unauthorized to read this file");
    }

    /* check if user can modify a file
    - if user is owner
    - if user has been put in share list
    */
    public static async fileCanBeModified(user_id: string, file_id: string): Promise<boolean> {
        return await this.fileCanBeViewed(user_id, file_id);
    }

    // check if user can copy a file
    public static async fileCanBeCopied(user_id: string, file_id: string): Promise<boolean> {
        return await this.fileCanBeViewed(user_id, file_id);
    }

    // check if an user can move a file
    public static async fileCanBeMoved(user_id: string, file_id: string): Promise<boolean> {
        return await this.isFileOwner(user_id, file_id);
    }



    /**
     * FILE CHECKERS
     */
    public static fileIsDocument(file: IFile): boolean {
        return (file.type == FileType.DOCUMENT);
    }
    
    public static fileIsDirectory(file: IFile): boolean {
        return (file.type == FileType.DIRECTORY);
    }

    // throwers
    public static requireFileIsDocument(file: IFile): void {
        if(FileService.fileIsDocument(file) == false)
            throw new HTTPError(HttpCodes.BAD_REQUEST, "File isn't a document");
    }

    public static requireFileIsDirectory(file: IFile): void {
        if(FileService.fileIsDirectory(file) == false)
            throw new HTTPError(HttpCodes.BAD_REQUEST, "File isn't a directory");
    }



    /**
     * ACTIONS
     */
    // create file service
    public static async createDocument(file: IFile, filename: string, content_type: string, fileContentBuffer: Buffer): Promise<IFile> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // be sure that file has a parent_id
        requireNonNull(file.parent_file_id);

        // check that parentFile is a valid Directory
        const parentFile: IFile = requireNonNull(await File.findById(file.parent_file_id).exec());
        FileService.requireFileIsDirectory(parentFile);

        // create readable
        const readablefileContent = new Readable()
        readablefileContent.push(fileContentBuffer)
        readablefileContent.push(null)

        // push document to gridfs
        const docId: string = await GridFSTalker.create(filename, content_type, readablefileContent);
        file.document_id = docId;

        // get file size and save it in File model
        file.length = fileContentBuffer.length;

        return await file.save();
    }

    // create a directory service
    public static async createDirectory(file: IFile): Promise<IFile> {
        // be sure that file is a directory
        FileService.requireFileIsDirectory(file);

        // check that there is no gridfs document_id set (because a directory isn't a document)
        requireIsNull(file.document_id);

        // save the directory
        return await file.save();
    }

    public static async search(user: IUser, searchBody: Record<string, unknown>): Promise<IFile[]> {
        const { name, mimetypes, startLastModifiedDate, endLastModifiedDate, tagIDs } = searchBody;

        // generate the mongodb search object
        let searchArray: Record<string, unknown> = {};
        searchArray = Object.assign(searchArray, { 'owner_id': user._id });

        if(name)
            searchArray = Object.assign(searchArray, { "name": { "$regex": name, "$options": "i" } }); //"$options": "i" remove the need to manage uppercase in the user search

        if(mimetypes)
            searchArray = Object.assign(searchArray, { "mimetype": { "$in": mimetypes } });
        
        if(startLastModifiedDate && endLastModifiedDate)
            searchArray = Object.assign(searchArray, { "updated_at": { "$gt": startLastModifiedDate, "$lt": endLastModifiedDate } });
        else if(startLastModifiedDate)
            searchArray = Object.assign(searchArray, { "updated_at": { "$gt": startLastModifiedDate } });
        else if(endLastModifiedDate)
            searchArray = Object.assign(searchArray, { "updated_at": { "$lt": endLastModifiedDate } });

        if(tagIDs)
            searchArray = Object.assign(searchArray, { "tags": { $elemMatch: { "_id": { $in: tagIDs } }} });

        // run the search
        return await File.find(searchArray).exec();
    }

    // get file informations from gridfs
    public static async getFileInformations(file: IFile): Promise<any> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // get file infos and return it
        return await GridFSTalker.getFileInfos(Types.ObjectId(file.document_id));
    }

    // get file content from gridfs (to start a download for example)
    public static async getFileContent(file: IFile): Promise<Record<string, MongoClient.GridFSBucketReadStream>> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // get file infos & content
        const infos: any                              = await GridFSTalker.getFileInfos(Types.ObjectId(file.document_id));
        const out: MongoClient.GridFSBucketReadStream = GridFSTalker.getFileContent(Types.ObjectId(file.document_id));

        return { infos: infos, stream: out };
    }

    // update a document content
    public static async updateContentDocument(file: IFile, fileContentBuffer: Buffer): Promise<any> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // get file name
        const fileGridFSInfos: any = await GridFSTalker.getFileInfos(Types.ObjectId(file.document_id));

        // prepare readable
        const readablefileContent = new Readable();
        readablefileContent.push(fileContentBuffer);
        readablefileContent.push(null);

        // get gridfs for document_id and put data in it
        const newDocumentId: string = await GridFSTalker.update(Types.ObjectId(file.document_id), fileGridFSInfos.filename, fileGridFSInfos.contentType, readablefileContent);
        file.document_id = newDocumentId;

        // get file size and save it in File model
        file.length = fileContentBuffer.length;

        return await file.save();
    }

    // edit a document attributes
    public static async editDocument(file: IFile): Promise<IFile> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // check that id != parent_id
        if(file._id == file.parent_file_id)
            throw new HTTPError(HttpCodes.INTERNAL_ERROR, "Directory can't be parent of himself");

        // be sure that file has a valid parent_id
        requireNonNull(file.parent_file_id);

        // check that parentFile is a valid Directory
        const parentFile: IFile = requireNonNull(await File.findById(file.parent_file_id).exec());
        FileService.requireFileIsDirectory(parentFile);

        // get document in GridFS to check that the document storage still existing
        if(await GridFSTalker.exists(Types.ObjectId(file.document_id)))
            return await file.save();
        else
            throw new HTTPError(HttpCodes.NOT_FOUND, "GridFS File doesn't exist");
    }

    // edit a document attributes
    public static async editDirectory(file: IFile): Promise<IFile> {
        // be sure that file is a directory
        FileService.requireFileIsDirectory(file);

        // check that id != parent_id
        if(file._id == file.parent_file_id)
            throw new HTTPError(HttpCodes.INTERNAL_ERROR, "Directory can't be parent of himself");

        // check that there is no gridfs document_id set (because a directory isn't a document)
        requireIsNull(file.document_id);

        // save new version of the directory
        return await file.save();
    }

    // delete document
    public static async deleteDocument(file: IFile): Promise<any> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // delete file from gridfs
        await GridFSTalker.delete(Types.ObjectId(file.document_id));

        // delete the from file data
        return await File.findByIdAndDelete(file._id).exec();
    }

    // delete a directory
    public static async deleteDirectory(file: IFile, forceDeleteRoot = false): Promise<any> {
        // be sure that file is a directory
        FileService.requireFileIsDirectory(file);

        // if file don't have parent, we don't delete it because it's a root dir
        if(!forceDeleteRoot)
            requireNonNull(file.parent_file_id);

        // start deleting
        // find all child files
        const files: IFile[] = await File.find({ parent_file_id: file._id }).exec();
        files.forEach(fileToDelete => {
            // delete directory and document recursively
            if(fileToDelete.type == FileType.DIRECTORY)
                FileService.deleteDirectory(fileToDelete);
            else
                FileService.deleteDocument(fileToDelete);
        });

        // delete directory
        return await File.findByIdAndDelete(file._id).exec();
    }

    // copy a document
    public static async copyDocument(user: IUser, file: IFile, destination_id: string, copyFileName: string | undefined = undefined): Promise<IFile> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);

        // get document informations from gridfs
        const fileGridFsInformations: any                    = await GridFSTalker.getFileInfos(Types.ObjectId(file.document_id));
        const fileReader: MongoClient.GridFSBucketReadStream = GridFSTalker.getFileContent(Types.ObjectId(file.document_id));


        // ***** generate new filename *****
        if(copyFileName == undefined) {
            // change to something != undefined
            copyFileName = "";

            // split to find extension later
            const filenameSplit = file.name.split(".");
            // if there is an extension
            if(filenameSplit.length > 1) {
                // we concanate all if there is multi points
                for(let i = 0; i < filenameSplit.length - 1; i++)
                    copyFileName += filenameSplit[i];

                // generate final filename
                copyFileName = copyFileName + " - Copy" + filenameSplit[filenameSplit.length - 1];
            } else {
                // if there is no point, we just add the postfix
                copyFileName = file.name + " - Copy"
            }
        }
        // ***********************



        // start copying
        const objectId: string = await GridFSTalker.create(copyFileName, fileGridFsInformations.contentType, fileReader); // generate the copy of the document in grid fs

        // generate new file informations
        const newFile: IFile = new File();
        newFile._id            = Guid.raw();
        newFile.type           = file.type;
        newFile.mimetype       = file.mimetype;
        newFile.name           = copyFileName;
        newFile.length         = file.length;
        newFile.document_id    = objectId;   
        newFile.parent_file_id = destination_id;
        newFile.owner_id       = user._id;

        return await newFile.save(); // save the new file
    }

    // copy a directory
    public static async copyDirectory(user: IUser, file: IFile, destination_id: string, copyFileName: string | undefined = undefined): Promise<IFile> {
        // be sure that file is a directory
        FileService.requireFileIsDirectory(file);


        // ***** generate new filename *****
        if(copyFileName == undefined) {
            // change to something != undefined
            copyFileName = file.name + " - Copy"
        }
        // ***********************


        // generate new file informations
        const newFile: IFile = new File();
        newFile._id            = Guid.raw();
        newFile.type           = file.type;
        newFile.name           = copyFileName;
        newFile.mimetype       = "application/x-dir";
        newFile.parent_file_id = destination_id;
        newFile.owner_id       = user._id;

        // start copying
        const out: IFile = await newFile.save(); // save the new directory file

        // find all child files
        const files = await File.find({ parent_file_id: file._id }).exec();
        for(let i = 0; i < files.length; i++) {
            const fileToCopy: IFile = files[i];
            // copy directory and document recursively
            if(fileToCopy.type == FileType.DIRECTORY)
                await FileService.copyDirectory(user, fileToCopy, out._id, fileToCopy.name);
            else
                await FileService.copyDocument(user, fileToCopy, out._id, fileToCopy.name);
        }

        return out;
    }


    // generate pdf file
    public static generatePDF(file: IFile): Promise<Readable> {
        return new Promise(async (resolve, reject) => {
            // be sure that file is a document
            FileService.requireFileIsDocument(file);

            // go take content in gridfs and build content buffer
            const content: Record<string, MongoClient.GridFSBucketReadStream> = await FileService.getFileContent(file);
            const buffer: Buffer = await streamToBuffer(content.stream); // used to rebuild document from a stream of chunk

            // check that extension is available to the preview generation
            const validExtensions = ["ez","aw","atom","atomcat","atomsvc","bdoc","ccxml","cdmia","cdmic","cdmid","cdmio","cdmiq","cu","mdp","davmount","dbk","dssc","xdssc","ecma","emma","epub","exi","pfr","woff","woff2","gml","gpx","gxf","stk","ink","inkml","ipfix","jar","war","ear","ser","class","js","json","map","json5","jsonml","jsonld","lostxml","hqx","cpt","mads","webmanifest","mrc","mrcx","ma","nb","mb","mathml","mbox","mscml","metalink","meta4","mets","mods","m21","mp21","mp4s","m4p","doc","dot","mxf","bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer","oda","opf","ogx","omdoc","onetoc","onetoc2","onetmp","onepkg","oxps","xer","pdf","pgp","asc","sig","prf","p10","p7m","p7c","p7s","p8","ac","cer","crl","pkipath","pki","pls","ai","eps","ps","cww","pskcxml","rdf","rif","rnc","rl","rld","rs","gbr","mft","roa","rsd","rss","rtf","sbml","scq","scs","spq","spp","sdp","setpay","setreg","shf","smi","smil","rq","srx","gram","grxml","sru","ssdl","ssml","tei","teicorpus","tfi","tsd","plb","psb","pvb","tcap","pwn","aso","imp","acu","atc","acutc","air","fcdt","fxp","fxpl","xdp","xfdf","ahead","azf","azs","azw","acc","ami","apk","cii","fti","atx","mpkg","m3u8","pkpass","swi","iota","aep","mpm","bmi","rep","cdxml","mmd","cdy","cla","rp9","c4g","c4d","c4f","c4p","c4u","c11amc","c11amz","csp","cdbcmsg","cmc","clkx","clkk","clkp","clkt","clkw","wbs","pml","ppd","car","pcurl","dart","rdz","uvf","uvvf","uvd","uvvd","uvt","uvvt","uvx","uvvx","uvz","uvvz","fe_launch","dna","mlp","dpg","dfac","kpxx","ait","svc","geo","mag","nml","esf","msf","qam","slt","ssf","es3","et3","ez2","ez3","fdf","mseed","seed","dataless","gph","ftc","fm","frame","maker","book","fnc","ltf","fsc","oas","oa2","oa3","fg5","bh2","ddd","xdw","xbd","fzs","txd","ggb","ggt","gex","gre","gxt","g2w","g3w","gmx","gdoc","gslides","gsheet","kml","kmz","gqf","gqs","gac","ghf","gim","grv","gtm","tpl","vcg","hal","zmm","hbci","les","hpgl","hpid","hps","jlt","pcl","pclxl","sfd-hdstx","mpy","afp","listafp","list3820","irm","sc","icc","icm","igl","ivp","ivu","igm","xpw","xpx","i2g","qbo","qfx","rcprofile","irp","xpr","fcs","jam","rms","jisp","joda","ktz","ktr","karbon","chrt","kfo","flw","kon","kpr","kpt","ksp","kwd","kwt","htke","kia","kne","knp","skp","skd","skt","skm","sse","lasxml","lbd","lbe","123","apr","pre","nsf","org","scm","lwp","portpkg","mcd","mc1","cdkey","mwf","mfm","flo","igx","mif","daf","dis","mbk","mqy","msl","plc","txf","mpn","mpc","xul","cil","cab","xls","xlm","xla","xlc","xlt","xlw","xlam","xlsb","xlsm","xltm","eot","chm","ims","lrm","thmx","cat","stl","ppt","pps","pot","ppam","pptm","sldm","ppsm","potm","mpp","mpt","docm","dotm","wps","wks","wcm","wdb","wpl","xps","mseq","mus","msty","taglet","nlu","ntf","nitf","nnd","nns","nnw","ngdat","n-gage","rpst","rpss","edm","edx","ext","odc","otc","odb","odf","odft","odg","otg","odi","oti","odp","otp","ods","ots","odt","odm","ott","oth","xo","dd2","oxt","pptx","sldx","ppsx","potx","xlsx","xltx","docx","dotx","mgp","dp","esa","pdb","pqa","oprc","paw","str","ei6","efif","wg","plf","pbd","box","mgz","qps","ptid","qxd","qxt","qwd","qwt","qxl","qxb","bed","mxl","musicxml","cryptonote","cod","rm","rmvb","link66","st","see","sema","semd","semf","ifm","itp","iif","ipk","twd","twds","mmf","teacher","sdkm","sdkd","dxp","sfs","sdc","sda","sdd","smf","sdw","vor","sgl","smzip","sm","sxc","stc","sxd","std","sxi","sti","sxm","sxw","sxg","stw","sus","susp","svd","sis","sisx","xsm","bdm","xdm","tao","pcap","cap","dmp","tmo","tpt","mxs","tra","ufd","ufdl","utz","umj","unityweb","uoml","vcx","vsd","vst","vss","vsw","vis","vsf","wbxml","wmlc","wmlsc","wtb","nbp","wpd","wqd","stf","xar","xfdl","hvd","hvs","hvp","osf","osfpvg","saf","spf","cmp","zir","zirz","zaz","vxml","wgt","hlp","wsdl","wspolicy","7z","abw","ace","aab","x32","u32","vox","aam","aas","bcpio","torrent","blb","blorb","bz","bz2","boz","cbr","cba","cbt","cbz","cb7","vcd","cfs","chat","pgn","crx","cco","nsc","cpio","csh","udeb","dgc","dir","dcr","dxr","cst","cct","cxt","w3d","fgd","swa","wad","ncx","dtb","res","dvi","evy","eva","bdf","gsf","psf","otf","pcf","snf","ttf","ttc","pfa","pfb","pfm","afm","arc","spl","gca","ulx","gnumeric","gramps","gtar","hdf","php","install","jardiff","jnlp","latex","luac","lzh","lha","run","mie","prc","mobi","application","lnk","wmd","wmz","xbap","mdb","obd","crd","clp","com","bat","mvb","m13","m14","wmf","emf","emz","mny","pub","scd","trm","wri","nc","cdf","pac","nzb","pl","pm","p12","pfx","p7b","spc","p7r","rar","rpm","ris","sea","sh","shar","swf","xap","sql","sit","sitx","srt","sv4cpio","sv4crc","t3","gam","tar","tcl","tk","tex","tfm","texinfo","texi","obj","ustar","src","webapp","der","crt","pem","fig","xlf","xpi","xz","z1","z2","z3","z4","z5","z6","z7","z8","xaml","xdf","xenc","xhtml","xht","xml","xsl","xsd","dtd","xop","xpl","xslt","xspf","mxml","xhvml","xvml","xvm","yang","yin","zip","adp","au","snd","mid","midi","kar","rmi","mp4a","m4a","mpga","mp2","mp2a","mp3","m2a","m3a","oga","ogg","spx","s3m","sil","uva","uvva","eol","dra","dts","dtshd","lvp","pya","ecelp4800","ecelp7470","ecelp9600","rip","wav","weba","aac","aif","aiff","aifc","caf","flac","mka","m3u","wax","wma","ram","ra","rmp","xm","cdx","cif","cmdf","cml","csml","xyz","bmp","cgm","g3","gif","ief","jpeg","jpg","jpe","ktx","png","btif","sgi","svg","svgz","tiff","tif","psd","uvi","uvvi","uvg","uvvg","djvu","djv","sub","dwg","dxf","fbs","fpx","fst","mmr","rlc","mdi","wdp","npx","wbmp","xif","webp","3ds","ras","cmx","fh","fhc","fh4","fh5","fh7","ico","jng","sid","pcx","pic","pct","pnm","pbm","pgm","ppm","rgb","tga","xbm","xpm","xwd","eml","mime","igs","iges","msh","mesh","silo","dae","dwf","gdl","gtw","mts","vtu","wrl","vrml","x3db","x3dbz","x3dv","x3dvz","x3d","x3dz","appcache","manifest","ics","ifb","coffee","litcoffee","css","csv","hjson","html","htm","shtml","jade","jsx","less","mml","n3","txt","text","conf","def","list","log","in","ini","dsc","rtx","sgml","sgm","stylus","styl","tsv","t","tr","roff","man","me","ms","ttl","uri","uris","urls","vcard","curl","dcurl","mcurl","scurl","fly","flx","gv","3dml","spot","jad","wml","wmls","vtt","s","asm","c","cc","cxx","cpp","h","hh","dic","htc","f","for","f77","f90","hbs","java","lua","markdown","md","mkd","nfo","opml","p","pas","pde","sass","scss","etx","sfv","ymp","uu","vcs","vcf","yaml","yml","3gp","3gpp","3g2","h261","h263","h264","jpgv","jpm","jpgm","mj2","mjp2","ts","mp4","mp4v","mpg4","mpeg","mpg","mpe","m1v","m2v","ogv","qt","mov","uvh","uvvh","uvm","uvvm","uvp","uvvp","uvs","uvvs","uvv","uvvv","dvb","fvt","mxu","m4u","pyv","uvu","uvvu","viv","webm","f4v","fli","flv","m4v","mkv","mk3d","mks","mng","asf","asx","vob","wm","wmv","wmx","wvx","avi","movie","smv","ice"];
            const extension: string = path.extname(file.name); // calculate extension
            if(!validExtensions.includes(extension.substring(1)))
                throw new HTTPError(HttpCodes.BAD_REQUEST, "This kind of file can't be previewed");

            // convert content
            libre.convert(buffer, "pdf", undefined, (err: Error, data: any) => {
                if(err)
                    reject(err);

                // create readable
                const readablePDF = new Readable();
                readablePDF.push(data);
                readablePDF.push(null);

                resolve(readablePDF);
            });
        });
    }

    // ask to preview a file
    public static async generatePreview(file: IFile): Promise<Readable> {
        // be sure that file is a document
        FileService.requireFileIsDocument(file);


        // go take content in gridfs and build content buffer
        const content: any = await FileService.getFileContent(file);
        const buffer: Buffer = await streamToBuffer(content.stream); // used to rebuild document from a stream of chunk

        // if file got an easy output type we use it
        const startMime: string = file.mimetype.split("/")[0];
        if(startMime == "image") {
            // resize
            const imageResizedBuffer: Buffer = await sharp(buffer).resize({ width: 200 }).extract({ left: 0, top: 0, width: 200, height: 130 }).png().toBuffer();

            // create readable
            const readableOutputImg = new Readable();
            readableOutputImg.push(imageResizedBuffer);
            readableOutputImg.push(null);

            return readableOutputImg;
        }

        // generate temp directory tree
        fs.mkdirSync(path.join('tmp', 'input'), { recursive: true });
        fs.mkdirSync(path.join('tmp', 'output'), { recursive: true });

        // calculate temp files paths
        const extension: string = path.extname(file.name); // calculate extension
        const tmpFilename: string = file._id + extension;
        const tempInputFile: string = path.join("tmp", "input", tmpFilename);
        const tempOutputImage: string = path.join("tmp", "output", file._id + ".png");

        // check that extension is available to the preview generation
        const validExtensions = ["doc","dot","xml","docx","docm","dotx","dotm","wpd","wps","rtf","txt","csv","sdw","sgl","vor","uot","uof","jtd","jtt","hwp","602","pdb","psw","ods","ots","sxc","stc","xls","xlw","xlt","xlsx","xlsm","xltx","xltm","xlsb","wk1","wks","123","dif","sdc","dbf","slk","uos","htm","html","pxl","wb2","odp","odg","otp","sxi","sti","ppt","pps","pot","pptx","pptm","potx","potm","sda","sdd","sdp","uop","cgm","pdf","otg","sxd","std","jpeg","wmf","jpg","sgv","psd","pcx","bmp","pct","ppm","sgf","gif","dxf","met","pgm","ras","svm","xbm","emf","pbm","plt","tga","xpm","eps","pcd","png","tif","tiff","odf","sxm","smf","mml","odt","ott","sxw","stw","org","swf","oth"];
        if(!validExtensions.includes(extension.substring(1)))
            throw new HTTPError(HttpCodes.BAD_REQUEST, "This kind of file can't be previewed");

        // save input file in temp file
        fs.writeFileSync(tempInputFile, buffer);

        // generate image and save it in a temp directory
        const options = {
            quality: 100,
            background: '#ffffff',
            pagerange: '1'
        };

        // generate image
        filepreview.generateSync(tempInputFile, tempOutputImage, options);

        // resize
        const contentOutputFile: Buffer = await sharp(tempOutputImage).resize({ width: 200 }).extract({ left: 0, top: 0, width: 200, height: 130 }).png().toBuffer();

        // create readable
        const readableOutput = new Readable();
        readableOutput.push(contentOutputFile);
        readableOutput.push(null);

        // delete two temp files
        fs.unlinkSync(tempInputFile);
        fs.unlinkSync(tempOutputImage);

        return readableOutput;
    }

}

export default FileService;