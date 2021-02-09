import { BaseData } from "./BaseData";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { G_SignalManager, G_NetworkManager } from "../init";
import { handler } from "../utils/handler";

let schema = {};
schema['avatar_photo'] = [
    'object',
    {}
];

export interface AvatarPhotoData {
    getAvatar_photo(): Object
    setAvatar_photo(value: Object): void
    getLastAvatar_photo(): Object
}
export class AvatarPhotoData extends BaseData {
    public static schema = schema;

    constructor() {
        super()
        this._recvGetActiveAvatarPhoto = G_NetworkManager.add(MessageIDConst.ID_S2C_GetActiveAvatarPhoto, this._s2cGetActiveAvatarPhoto.bind(this));
        this._recvActiveAvatarPhoto = G_NetworkManager.add(MessageIDConst.ID_S2C_ActiveAvatarPhoto, this._s2cActiveAvatarPhoto.bind(this));
    }
    private _recvGetActiveAvatarPhoto;
    private _recvActiveAvatarPhoto;

    clear() {
        this._recvGetActiveAvatarPhoto.remove();
        this._recvGetActiveAvatarPhoto = null;
        this._recvActiveAvatarPhoto.remove();
        this._recvActiveAvatarPhoto = null;
    }
    reset() {
    }
    isActiveWithId(id) {
        var avatarPhoto = this.getAvatar_photo();
        for (var i in avatarPhoto) {
            var photoId = avatarPhoto[i];
            if (photoId == id) {
                return true;
            }
        }
        return false;
    }
    _s2cGetActiveAvatarPhoto(id, message) {
        var avatarPhoto = message['avatar_photo'] || {};
        this.setAvatar_photo(avatarPhoto);
    }
    c2sActiveAvatarPhoto(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActiveAvatarPhoto, { id: id });
    }
    _s2cActiveAvatarPhoto(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var photoId = message['id'] || 0;
        G_SignalManager.dispatch(SignalConst.EVENT_AVATAR_PHOTO_ACTIVE_SUCCESS, photoId);
    }
}