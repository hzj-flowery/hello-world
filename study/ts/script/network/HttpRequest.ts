export class HttpRequest {

    private _url: string;
    private _httpRequest: XMLHttpRequest;
    private _successCallback: Function;
    private _failCallback: Function;

    public get(url: string, successCallback?: Function, failCallback?: Function) {
        this._send(url, "GET", successCallback, failCallback);
    }

    public post(url: string, successCallback?: Function, failCallback?: Function) {
        this._send(url, "POST", successCallback, failCallback);
    }

    private _send(url: string, type: string = "GET", successCallback: Function, failCallback: Function) {
        this._url = url;
        this._successCallback = successCallback;
        this._failCallback = failCallback;

        this._httpRequest = new XMLHttpRequest();
        this._httpRequest.open(type, this._url);
        this._httpRequest.onreadystatechange = this._onReadyStateChange.bind(this);
        this._httpRequest.send();
    }

    private _abort() {
        if (this._httpRequest != null) {
            this._httpRequest.abort();
            this._httpRequest = null;
        }
    }

    private _onReadyStateChange() {
        let response = null;
        if (this._httpRequest.readyState == 4) {
            if (this._httpRequest.status >= 200 && this._httpRequest.status < 207) {
                response = this._httpRequest.response;
                if (this._successCallback) {
                    this._successCallback(response);
                }
            }
            else {
                if (this._failCallback) {
                    this._failCallback();
                }
            }
            this._abort();
        }
    }
}