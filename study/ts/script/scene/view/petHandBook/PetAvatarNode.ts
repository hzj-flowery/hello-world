const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';

@ccclass
export default class PetAvatarNode extends cc.Component {

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _commonAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNoShow: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _clickPanel: cc.Node = null;
    _baseId: any;

    init() {
        this._commonAvatar.init();
    }

    updateUI(petId) {
        var params = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, petId);
        this.updateBaseId(petId);
    }
    doNoShow() {
        this._imageNoShow.node.active = (true);
        this._commonAvatar.node.active = (false);
    }
    darkNode() {
        this._imageNoShow.node.active = (false);
        this._commonAvatar.node.active = (true);
        this._commonAvatar.setAction('idle_ex', true);
    }
    highLightNode() {
        this._imageNoShow.node.active = (false);
        this._commonAvatar.node.active = (true);
        this._commonAvatar.setAction('idle', true);
    }
    onCreate() {
        this._commonAvatar.setTouchEnabled(false);
    }
    turnBack() {
        this._commonAvatar.turnBack();
    }
    updateBaseId(baseId, animSuffix?) {
        this._commonAvatar.setConvertType(TypeConvertHelper.TYPE_PET);
        this._baseId = baseId;
        this._commonAvatar.updateUI(baseId, '_small');
        this._commonAvatar.setScale(1.6);
    }
    setAction(ani, loop) {
        this._commonAvatar.setAction(ani, loop);
    }
    setCallBack(callBack) {
        this._commonAvatar.setTouchEnabled(true);
        this._commonAvatar.setCallBack(callBack);
    }
    setUserData(data) {
        this._commonAvatar.setUserData(data);
    }
    onEnter() {
    }
    onExit() {
    }

}