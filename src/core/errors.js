export class OfficeFileError extends Error {
    constructor(message, hint) {
        super(message);
        this.name = "OfficeFileError";
        this.hint = hint;
    }
}
