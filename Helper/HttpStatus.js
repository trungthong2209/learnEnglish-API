export default class HttpStatus {
    constructor(httpCode, entity) {
        let httpMessage = HttpStatus.httpStatusCodes[httpCode];
        this.entity = entity;
        this.code = httpCode;
        this.message = httpMessage;
    }
    static httpStatusCodes = {
        200: "OK",
        201: "Created",
        202: "Accepted",
        203: "Non-Authoritative Information",
        204: "No Content",
        205: "Reset Content",
        206: "Partial Content",
        207: "Multi-Status (WebDAV)",
        208: "Already Reported (WebDAV)",
        226: "IM Used",
        300: "Multiple Choices",
        301: "Moved Permanently",
        302: "Found",
        303: "See Other",
        304: "Not Modified",
        305: "Use Proxy",
        306: "(Unused)",
        307: "Temporary Redirect",
        308: "Permanent Redirect (experiemental)",
        400: "Bad Request",
        401: "Unauthorized",
        402: "Payment Required",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        406: "Not Acceptable",
        407: "Proxy Authentication Required",
        408: "Request Timeout",
        409: "Conflict",
        410: "Gone",
        411: "Length Required",
        412: "Precondition Failed",
        413: "Request Entity Too Large",
        414: "Request-URI Too Long",
        415: "Unsupported Media Type",
        416: "Requested Range Not Satisfiable",
        417: "Expectation Failed",
        418: "Im a teapot (RFC 2324)",
        420: "Enhance Your Calm (Twitter)",
        422: "Unprocessable Entity (WebDAV)",
        423: "Locked (WebDAV)",
        424: "Failed Dependency (WebDAV)",
        425: "Reserved for WebDAV",
        426: "Upgrade Required",
        428: "Precondition Required",
        429: "Too Many Requests",
        431: "Request Header Fields Too Large",
        444: "No Response (Nginx)",
        449: "Retry With (Microsoft)",
        450: "Blocked by Windows Parental Controls (Microsoft)",
        451: "Unavailable For Legal Reasons",
        499: "Client Closed Request (Nginx)",
        500: "Internal Server Error",
        501: "Not Implemented",
        502: "Bad Gateway",
        503: "Service Unavailable",
        504: "Gateway Timeout",
        505: "HTTP Version Not Supported",
        506: "Variant Also Negotiates (Experimental)",
        507: "Insufficient Storage (WebDAV)",
        508: "Loop Detected (WebDAV)",
        509: "Bandwidth Limit Exceeded (Apache)",
        510: "Not Extended",
        511: "Network Authentication Required",
        598: "Network read timeout error",
        599: "Network connect timeout error",
    };

    static getHttpStatus(err) {
        let httpStatus;
        if (err instanceof ErrorHandler) {
            httpStatus = new HttpStatus(err.status, null);
            httpStatus.message = err.message;
        }
        if (err.status) {
            //if err.status is string then convert string to number for status code
            if (isNaN(err.status)) {
                let statusCode = 0;
                statusCode = this.ConvertStatuCode(err.status);
                httpStatus = new HttpStatus(statusCode, null);
            } else {
                httpStatus = new HttpStatus(err.status, null);
            }
        } else if (err.statusCode) {
            httpStatus = new HttpStatus(err.statusCode, null);
        } else {
            httpStatus = new HttpStatus(HttpStatus.SERVER_ERROR, null);
        }
        if (err.error) {
            httpStatus.message = err.error;
        } else {
            httpStatus.message = err.message;
        }
        return httpStatus;
    }
    static ConvertStatuCode(status = '') {
        let statusCode = 0;
        switch (status) {
            case 'OK':
                statusCode = 200;
                break;
            case 'Not Found':
                statusCode = 404;
                break;
            case 'Unauthorized':
                statusCode = 401;
                break;
            case 'Internal Server Error':
                statusCode = 500;
                break;
            case 'Not Acceptable':
                statusCode = 406;
                break;
            case 'Conflict':
                statusCode = 409;
                break;
            case 'Bad Request':
                statusCode = 400;
                break;
        }
        return statusCode;
    }
    static OK = 200;
    static NO_CONTENT = 204;
    static NOT_FOUND = 404;
    static UNAUTHORISED = 401;
    static SERVER_ERROR = 500;
    static NOT_ACCEPTABLE = 406;
    static CONFLICT = 409;
    static BAD_REQUEST = 400;
    static NON_AUTHENTICATION_INFO = 203;
}