const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from './CommonHeroAvatar'
import { handler } from '../../utils/handler';
import { Lang } from '../../lang/Lang';
import { G_UserData, Colors } from '../../init';
import { UserBaseData } from '../../data/UserBaseData';
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';
import { TeamDataHelper } from '../../utils/data/TeamDataHelper';
import UIHelper from '../../utils/UIHelper';
import { WayFuncDataHelper } from '../../utils/data/WayFuncDataHelper';
import { PopupHonorTitleHelper } from '../../scene/view/playerDetail/PopupHonorTitleHelper';

@ccclass
export default class CommonMainHeroNode extends cc.Component {

    private _rootNode: cc.Node;
    private _avatar: CommonHeroAvatar;
    private _heroName: cc.Label;
    private _imageLock: cc.Node;
    private _imageAdd: cc.Node;
    private _heroLevel: cc.Label;
    private _imageRedPoint: cc.Node;
    private _textOfficial: cc.Label;
    private _imageArrow: cc.Node;
    private _imageTitle: cc.Node;
    private _textOpenLevel: cc.Label;

    private _funcId: number;
    private _heroId: number;
    private _limitLevel: number;

    public init() {
        this._rootNode = this.node.children[0];
        this._avatar = this._rootNode.getChildByName('CommonAvatar').getComponent(CommonHeroAvatar);
        this._avatar.init();
        this._heroName = this._rootNode.getChildByName('Text_heroName').getComponent(cc.Label);
        this._imageLock = this._rootNode.getChildByName('Image_Lock');
        this._imageAdd = this._rootNode.getChildByName('Image_Add');
        this._heroLevel = this._rootNode.getChildByName('Text_heroLevel').getComponent(cc.Label);
        this._imageRedPoint = this._rootNode.getChildByName('Image_RedPoint');
        this._textOfficial = this._rootNode.getChildByName('Text_official').getComponent(cc.Label);
        this._imageArrow = this._rootNode.getChildByName('ImageArrow');
        this._imageTitle = this._rootNode.getChildByName('ImageTitle');
        this._textOpenLevel = this._rootNode.getChildByName('Text_open_level').getComponent(cc.Label);
        this._heroName.node.active = false;
        this._heroLevel.node.active = false;
        this._avatar.setCallBack(handler(this, this.onClickCallBack));
        this._avatar.setTouchEnabled(true);
        this._avatar.setScale(0.9);
        this._imageRedPoint.active = false;
        this._imageArrow.active = false;
        this._imageTitle.active = false;
        this.setLock(true);
    }

    public getFuncId() {
        return this._funcId;
    }

    public setFuncId(funcTeamSoltId) {
        this._funcId = funcTeamSoltId;
        this.setLock(true);
        this.showOpenLevel(false);
    }


    private _isLock() {
        var isLock = this._imageLock.active;
        return isLock;
    }

    private _isAdd() {
        var isAdd = this._imageAdd.active;
        return isAdd;
    }


    public showOpenLevel(needShow) {
        var openLevel = Lang.get('team_txt_unlock_position', { level: TeamDataHelper.getOpenLevelWithId(this._funcId) });
        this._textOpenLevel.string = openLevel;
        this._textOpenLevel.node.active = needShow;
        UIHelper.enableOutline(this._textOpenLevel, new cc.Color(142, 49, 3), 2);
    }

    public setLock(needLock) {
        needLock = needLock || false;
        this._avatar.showShadow(!needLock);
        this._heroName.node.active = false;
        this._imageLock.active = false;
        this._imageAdd.active = false;
        this._textOfficial.node.active = false;
        if (needLock) {
            this._imageLock.active = true;
        } else {
            this._imageAdd.active = true;
            this.showOpenLevel(false);
        }
    }

    public setAdd(showAdd) {
        showAdd = showAdd || false;
        this._avatar.showShadow(!showAdd);
        this._imageAdd.active = showAdd;
    }

    public setShadowVisible(visible) {
        this._avatar.showShadow(visible);
    }

    public onClickCallBack() {
        if (this._isLock() || this._funcId == null) {
            return;
        }
        if (this._isAdd() == false && this._heroId == null) {
            return;
        }
        WayFuncDataHelper.gotoModuleByFuncId(this._funcId);
    }

    public updateUI(heroId, isEquipAvatar, limitLevel, limitRedLevel) {
       
        if (this._heroId != heroId || this._limitLevel != limitLevel) {
            this._avatar.updateUI(heroId, null, null, limitLevel, null, null, limitRedLevel);
        }
        this._avatar.showAvatarEffect(isEquipAvatar);
        var height = this._avatar.getHeight();
        this._heroId = heroId;
        this._limitLevel = limitLevel;
        this._imageLock.active = false;
        this._imageAdd.active = false;
        this._avatar.showShadow(true);
        this._heroLevel.node.y = height + 18;
        this._imageRedPoint.y = height + 16;
        this._imageArrow.y = height + 16;
    }

    public updateHeroName(heroId, heroRank, heroLevel, limitLevel, limitRedLevel) {
        var heroParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId, null, heroRank, limitLevel,limitRedLevel);
        if (heroParams) {
            this._heroName.string = heroParams.name;
            this._heroName.node.active = true;
            this._heroName.node.color = heroParams.icon_color;
            UIHelper.enableOutline(this._heroName, heroParams.icon_color_outline, 2);
        }
        if (heroLevel && heroLevel > 0) {
            this._heroLevel.string = Lang.get('common_lv', { level: heroLevel });
            this._heroLevel.node.active = !heroParams.isGold;
            UIHelper.enableOutline(this._heroLevel, new cc.Color(88, 33, 6), 2);
        }
    }

    public setString(s) {
        this._heroName.string = s;
    }

    public updateOfficial(officelLevel?) {
        officelLevel = officelLevel || G_UserData.getBase().getOfficer_level();
        let args: any[] = G_UserData.getBase().getOfficialInfo(officelLevel);
        var officalInfo = args[0];
        let officalLevel = args[1];
        if (officalLevel <= 0) {
            return;
        }
        this._textOfficial.node.color = Colors.getOfficialColor(officalLevel);
        UIHelper.enableOutline(this._textOfficial, Colors.getOfficialColorOutline(officalLevel), 2);
        this._textOfficial.node.active = true;
        this._textOfficial.string = '[' + (officalInfo.name + ']');
    }

    public showRedPoint(visible) {
        this._imageRedPoint.active = visible;
    }

    public showImageArrow(visible) {
        this._imageArrow.active = visible;
    }

    /**
     * 显示或卸下称号
     */
    public changeTitle() {
        var titleItem = PopupHonorTitleHelper.getEquipedTitle();
        var titleId = titleItem && titleItem.getId() || 0;
        this._avatar.showTitle(titleId, "CommonMainHeroNode");
    }

}