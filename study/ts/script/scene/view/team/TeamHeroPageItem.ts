import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TeamHeroPageItem extends cc.Layout{

    private _commonHeroAvatar:any;
    private _avatar:CommonHeroAvatar;
    private _onClick:any;
    private _index:number;
    private _actionName:string;

    setInitData(width, height, onClick, index) {
        this._onClick = onClick;
        this._index = index;
        this._avatar = null;
        this._actionName = '';
        this.node.setContentSize(width, height);
        this._commonHeroAvatar = cc.resources.get(Path.getCommonPrefab("CommonHeroAvatar"))
        //this.setSwallowTouches(false);
    }
    updateUI(type, value, isEquipAvatar, limitLevel, limitRedLevel) {
        if (this._avatar == null) {
            this._avatar = (cc.instantiate(this._commonHeroAvatar) as cc.Node).getComponent(CommonHeroAvatar);
            this._avatar.init();
            this._avatar.setTouchEnabled(true);
            this._avatar.setCallBack(handler(this, this._onClickAvatar));
            var size = this.node.getContentSize();
            this._avatar.node.setPosition(new cc.Vec2(0,size.height / 2 - 100));
            this.node.addChild(this._avatar.node);
        }
        if (type == TypeConvertHelper.TYPE_HERO || type == TypeConvertHelper.TYPE_PET) {
            var param = TypeConvertHelper.convert(type, value);
            this._actionName = param.res_cfg.show_action;
        }
        if (type == TypeConvertHelper.TYPE_HERO) {
            this._avatar.setScale(1.4);
            this._avatar.setShadowScale(1);
        } else {
            this._avatar.setScale(1);
            this._avatar.setShadowScale(2.7);
        }
        this._avatar.setConvertType(type);
        this._avatar.updateUI(value, null,null, limitLevel, null, null, limitRedLevel);
        this._avatar.showAvatarEffect(isEquipAvatar, 1.4);
    }
    _onClickAvatar() {
        if (this._onClick) {
            this._onClick(this._index);
        }
    }
    getAvatar() {
        return this._avatar;
    }
    playSkillAnimationOnce() {
        if (this._actionName == '') {
            return;
        }
        if (this._avatar == null) {
            return;
        }
         this._avatar.playAnimationOnce(this._actionName);
       // this._avatar.setAction('idle', true);
        this.stopScheduler();
        if (this._actionName != 'idle') {
            this.schedule(this.playAnimation,30)
        }
    }

    private playAnimation():void{
        this._avatar.playAnimationOnce(this._actionName);
       // this._avatar.setAction('idle', true);
    }
    setIdleAnimation() {
        if (this._avatar == null) {
            return;
        }
        this._avatar.setAction('idle', true);
        this.stopScheduler();
    }
    stopScheduler() {
        this.unschedule(this.playAnimation)
    }
    setAvatarScale(scale) {
        this._avatar.setScale(scale);
    }
}