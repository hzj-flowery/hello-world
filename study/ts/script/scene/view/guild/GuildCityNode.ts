import { GuildConst } from "../../../const/GuildConst";
import { SignalConst } from "../../../const/SignalConst";
import { G_ConfigManager, G_SignalManager, G_UserData } from "../../../init";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import ResourceLoader, { ResourceData } from "../../../utils/resource/ResourceLoader";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildCityNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _button: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeDecorate: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNameBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageName: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _redPoint: cc.Sprite = null;

    _cityCfg: any;
    _listener: any;
    _nodeWorldBoss: any;
    _signalWorldBossGetInfo: any;

    initData(cityCfg, listener) {
        this._cityCfg = cityCfg;
        this._listener = listener;

        var data: Array<ResourceData> = [
            {path: "prefab/common/CommonHeroAvatar", type: cc.Prefab},
            {path: Path.getTextGuild(this._cityCfg.name_pic), type: cc.SpriteFrame},
            {path: Path.getGuildRes(this._cityCfg.pic), type: cc.SpriteFrame},
        ];
        ResourceLoader.loadResArrayWithType(data);
    }
    onCreate() {
        var cityNameX = this._cityCfg.name_postion_x - this._cityCfg.postion_x;
        var cityNameY = this._cityCfg.name_postion_y - this._cityCfg.postion_y;
        var isCityShow = this._cityCfg.open == 1;
        this.node.setPosition(this._cityCfg.postion_x, this._cityCfg.postion_y);
        // this._panelTouch.setSwallowTouches(false);
        // this._button.setSwallowTouches(false);

        this._button.sizeMode = cc.Sprite.SizeMode.RAW;
        UIHelper.loadTexture(this._button, Path.getGuildRes(this._cityCfg.pic));
        this._imageNameBg.node.active = (isCityShow);
        this._imageName.node.active = (isCityShow);
        this._redPoint.node.active = (isCityShow);
        this._nodeDecorate.active = (isCityShow);
        UIHelper.loadTexture(this._imageName, Path.getGuildRes(this._cityCfg.name_pic));

        // this._imageName.node.ignoreContentAdaptWithSize(true);
        this._imageName.sizeMode = cc.Sprite.SizeMode.RAW;
        var nameSize = this._imageName.node.getContentSize();
        var bgSize = this._imageNameBg.node.getContentSize();
        bgSize.height = nameSize.height + 40;
        this._imageNameBg.node.setContentSize(bgSize);
        this._imageNameBg.node.setPosition(cityNameX, cityNameY);
        if( !G_ConfigManager.checkCanRecharge()&& this._cityCfg.name == '军团商店') {
            this._imageNameBg.node.active = false;
        }

        // this._imageName.node.setPosition(cityNameX, cityNameY);
        // this._redPoint.node.setPosition(cityNameX + bgSize.width * 0.5 - 3, cityNameY + bgSize.height * 0.5 - 6);
    }
    onEnter() {
        if (this._cityCfg.id == GuildConst.CITY_BOSS_ID) {
            this._signalWorldBossGetInfo = G_SignalManager.add(SignalConst.EVENT_WORLDBOSS_GET_INFO, handler(this, this._onEventWorldBossGetInfo));
        }
    }
    onExit() {
        if (this._signalWorldBossGetInfo) {
            this._signalWorldBossGetInfo.remove();
            this._signalWorldBossGetInfo = null;
        }
    }
    refreshRedPoint(showRedPoint) {
        if (this._cityCfg.open == 1) {
            this._redPoint.node.active = (showRedPoint);
        }
    }
    refreshCityView() {
        if (this._cityCfg.open != 1) {
            return;
        }
        var openNeedLevel = this._cityCfg.show_level;
        var guildLevel = G_UserData.getGuild().getMyGuildLevel();
        var isOpen = openNeedLevel <= guildLevel;

        UIHelper.loadTexture(this._imageName, Path.getTextGuild(isOpen && this._cityCfg.name_pic || this._cityCfg.name_pic + 'b'))

        if (this._cityCfg.id == GuildConst.CITY_BOSS_ID) {
            if (isOpen && !this._nodeWorldBoss) {
                this._createWorldBoss();
            } else if (!isOpen && this._nodeWorldBoss) {
                this._nodeWorldBoss.removeFromParent();
                this._nodeWorldBoss = null;
            }
        }
    }
    doClick() {
        if (this._listener && this._cityCfg.open == 1) {
            this._listener(this, this.getCityData());
        }
    }
    _onCityClick(sender) {
        var offsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        var offsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        if (offsetX < 20 && offsetY < 20) {
            this.doClick();
            return true;
        } else {
            return false;
        }
    }
    getCityData() {
        return this._cityCfg;
    }
    _createWorldBoss() {
        var resource = cc.resources.get("prefab/common/CommonHeroAvatar");
        let node1 = cc.instantiate(resource) as cc.Node;
        let node = node1.getComponent(CommonHeroAvatar) as CommonHeroAvatar;
        node.init();
        node.node.scaleX = (0.5);
        node.node.scaleY = (0.5);
        node.node.y = (-5);
        this._nodeDecorate.addChild(node1);
        this._nodeWorldBoss = node;
        node.setCallBack(handler(this, this.doClick));
        this._onEventWorldBossGetInfo();
    }

    _onEventWorldBossGetInfo(event?: any) {
        if (this._nodeWorldBoss) {
            var bossInfo = G_UserData.getWorldBoss().getBossInfo();
            this._nodeWorldBoss.updateUI(bossInfo.hero_id);
        }
    }

}