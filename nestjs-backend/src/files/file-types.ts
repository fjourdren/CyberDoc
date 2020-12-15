export const TEXT_MIMETYPES = [
    "text/plain"
]

export const PDF_MIMETYPES = [
    "application/pdf"
]

export const DOCUMENT_MIMETYPES = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.oasis.opendocument.text",
]

export const SPREADSHEET_MIMETYPES = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.spreadsheet",
]

export const PRESENTATION_MIMETYPES = [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
    "application/vnd.oasis.opendocument.presentation"
]

export const ARCHIVE_MIMETYPES = [
    "application/x-tar",
    "application/vnd.rar",
    "application/x-7z-compressed",
    "application/x-gtar",
    "application/zip",
    "application/gzip",
    "application/vnd.ms-cab-compressed",
]

export const DIRECTORY_MIMETYPE = "application/x-dir";

export enum FileType {
    Folder = "Folder",
    Audio = "Audio",
    Video = "Video",
    Image = "Image",
    PDF = "PDF",
    Text = "Text",
    Document = "Document",
    Spreadsheet = "Spreadsheet",
    Presentation = "Presentation",
    Archive = "Archive",
    Unknown = "Unknown"
}