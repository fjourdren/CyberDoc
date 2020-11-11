import child_process from "child_process";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import os from "os";

const EXEC_TIMEOUT = 5000; //5 seconds

function ensureFileExists(path: string) {
    try {
        if (!fs.lstatSync(path).isFile()) { throw new Error("fs.lstatSync(path).isFile() == false") }
    } catch (err) {
        throw new Error(`File ${path} not exists (${err})`);
    }
}

export interface GeneratePreviewOptions {
    width?: number,
    height?: number
    forceAspect?: boolean,
    quality?: number,
    background?: string,
    pagerange?: string
}

export default function generatePreviewSync(inputPath: string, fileType: "other" | "video" | "image" | "pdf", outputPath: string, options: GeneratePreviewOptions) {

    // Check for supported outputPath format
    ensureFileExists(inputPath);
    var extOutput = path.extname(outputPath).toLowerCase().replace('.', '');
    if (extOutput != 'gif' && extOutput != 'jpg' && extOutput != 'png') {
        return false;
    }

    switch (fileType) {
        case "video": {
            const ffmpegArgs = ['-y', '-i', inputPath, '-vf', 'thumbnail', '-frames:v', '1', outputPath];
            if (options.width && options.height) {
                ffmpegArgs.splice(4, 1, 'thumbnail,scale=' + options.width + ':' + options.height + (options.forceAspect ? ':force_original_aspect_ratio=decrease' : ''));
            }
            child_process.execFileSync('ffmpeg', ffmpegArgs, {timeout: EXEC_TIMEOUT});
            break;
        }

        case "image":
        case "pdf": {
            const convertArgs = [inputPath + '[0]', outputPath];
            if (options.width && options.height) {
                convertArgs.splice(0, 0, '-resize', options.width + 'x' + options.height);
            }

            if (options.quality) {
                convertArgs.splice(0, 0, '-quality', options.quality.toString());
            }
            if (options.background) {
                convertArgs.splice(0, 0, '-background', options.background);
                convertArgs.splice(0, 0, '-flatten');
            }
            child_process.execFileSync('convert', convertArgs, {timeout: EXEC_TIMEOUT});
            break;
        }

        case "other": {
            let hash: any = crypto.createHash('sha512');
            hash.update(Math.random().toString());
            hash = hash.digest('hex');
            var tempPDF = path.join(os.tmpdir(), hash + '.pdf');

            var unoconv_pagerange = '1';
            var pagerange_start = 1;
            var pagerange_stop = 1;
            if (options.pagerange) {
                var pagerange = options.pagerange.split('-');
                if (pagerange.length == 2) {
                    unoconv_pagerange = options.pagerange;
                    pagerange_start = parseInt(pagerange[0]);
                    pagerange_stop = parseInt(pagerange[1]);
                }
            }

            child_process.execFileSync('unoconv', ['-e', 'PageRange=' + unoconv_pagerange, '-o', tempPDF, inputPath], {timeout: EXEC_TIMEOUT});

            if (unoconv_pagerange == '1') {
                convertOtherArgs = [tempPDF + '[0]', outputPath];
                if (options.width && options.height) {
                    convertOtherArgs.splice(0, 0, '-resize', options.width + 'x' + options.height);
                }
                if (options.quality) {
                    convertOtherArgs.splice(0, 0, '-quality', options.quality.toString());
                }
                child_process.execFileSync('convert', convertOtherArgs, {timeout: EXEC_TIMEOUT});
            } else {
                for (var x = 0; x < pagerange_stop; x++) {
                    var convertOtherArgs = [tempPDF + '[' + x + ']', x + '_' + outputPath];
                    if (options.width && options.height) {
                        convertOtherArgs.splice(0, 0, '-resize', options.width + 'x' + options.height);
                    }
                    if (options.quality) {
                        convertOtherArgs.splice(0, 0, '-quality', options.quality.toString());
                    }
                    child_process.execFileSync('convert', convertOtherArgs, {timeout: EXEC_TIMEOUT});
                }
            }

            fs.unlinkSync(tempPDF);
            break;
        }

        default: {
            throw new Error("Unknown fileType " + fileType);
        }
    }
}