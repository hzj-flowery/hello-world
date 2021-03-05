const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'

@ccclass
export default class SquadAvatar extends cc.Component {

    @property({ type: CommonHeroAvatar, visible: true })
    _commonHeroAvatar: CommonHeroAvatar = null;

    private _heroId;
    private _tag;

    public updateUI(heroId, limitLevel) {
        this._commonHeroAvatar.init();
        this._commonHeroAvatar.updateUI(heroId, '', false, limitLevel);
        this._commonHeroAvatar.setTouchEnabled(false);
        this._heroId = heroId;
    }

    public showAvatarEffect(bShow) {
        this._commonHeroAvatar.showAvatarEffect(true);
    }

    public setScale(scale) {
        this._commonHeroAvatar.setScale(scale);
    }

    public getHeroId() {
        return this._heroId;
    }

    public playAnimationNormal() {
        this._commonHeroAvatar.setAniTimeScale(1);
        this._commonHeroAvatar.setAction('idle', true);
    }

    public setOpacity(opacity) {
        return this._commonHeroAvatar.node.opacity = (opacity);
    }

    public getSpine() {
        return this._commonHeroAvatar;
    }

    public turnBack(bTrue) {
        this._commonHeroAvatar.turnBack(bTrue);
    }

    public setTag(tag) {
        this._tag = tag;
    }

    public getTag() {
        return this._tag;
    }
}