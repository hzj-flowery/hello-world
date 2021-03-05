export class StorageManager {
    private _serverID;
    private _userID;
    private _dirStorage;

    constructor() {
        this._dirStorage = "userdata/";
        this._serverID = "";
        this._userID = "";
    }

    public setUserInfo(serverID, userID) {
        this._serverID = serverID;
        this._userID = userID;
    }

    public load(filename) {
        var path = this._dirStorage + filename;
        var str = cc.sys.localStorage.getItem(path);
        if (str) {
            return JSON.parse(str);
        }
        return null;
    }

    public loadUser(filename) {
        var path = this._serverID + ('_' + (this._userID + ('_' + filename)));
        return this.load(path);
    }

    public save(filename, data) {
        this.saveString(filename, JSON.stringify(data));
    }

    public remove(filename) {
        let path = this._dirStorage + filename;
        cc.sys.localStorage.removeItem(path);
    }

    public saveString(filename, data) {
        var path = this._dirStorage + filename;
        cc.sys.localStorage.setItem(path, data);
    }

    public saveWithUser(filename, data) {
        var path = this._serverID + ('_' + (this._userID + ('_' + filename)));
        this.save(path, data);
    }
}