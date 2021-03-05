import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { UserData } from "../../../data/UserData";
import EffectGfxMoving from "../../../effect/EffectGfxMoving";
import { G_ConfigLoader, G_EffectGfxMgr, G_SceneManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";
import PopupReward from "../../../ui/popup/PopupReward";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import { WxUtil } from "../../../utils/WxUtil";
import DailyMissionActiviyValue from "../achievement/DailyMissionActiviyValue";

const { ccclass, property } = cc._decorator;


@ccclass
export default class WxInviteUserItem extends cc.Component {

    @property({ type: cc.Sprite, visible: true })
    _boxImage1: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _boxImage2: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _boxImage3: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imagehead: cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    _txtName: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _txtServer: cc.Label = null;
    @property({ type: CommonButtonLevel1Highlight, visible: true })
    _btnShare: CommonButtonLevel1Highlight = null;
    @property({ type: cc.ProgressBar, visible: true })
    _progress: cc.ProgressBar = null;

    private _boxRedpoint: Array<cc.Sprite> = [];
    private _boxEffect: Array<EffectGfxMoving> = [];

    private _data;

    public get data() {
        return this._data;
    }
    public set data(value) {
        this._data = value;
    }

    onLoad() {
        this._btnShare.addClickEventListenerEx(handler(this, this.onClickShare));
        for (let i = 1; i <= 3; i++) {
            UIHelper.addEventListenerToNode(this.node, this["_boxImage" + i].node, 'WxInviteUserItem', 'onBoxClick', i)
        }
        this._progress.progress = 0;
        this._btnShare.setString('提醒');
    }
    onClickShare() {
        WxUtil.shareAppMessage("名将传终于出小游戏啦", null);
    }

    updateData(userData) {
        this._data = userData;
        if (!userData) {
            this._imagehead.node.active = false;
            this._txtName.string = '没有邀请玩家';
        };
        this.node.active = true;
        var progress = 0;
        var needLvs = [0];
        var needLv;
        if (userData)  {
            for (var i = 1; i <= 3; i++) {
                var boxImage: cc.Sprite = this["_boxImage" + i];
                var cfg = G_ConfigLoader.getConfig(ConfigNameConst.SHARE_REWARD).get(i);
                needLv = cfg.parameter;
                needLvs.push(needLv);
                if ( userData.lv >= needLv) {
                    progress += 0.33;
                    var hasGetReward = userData.have_award_id.indexOf(i) != -1;
                    if (hasGetReward) {
                        UIHelper.loadTexture(boxImage, Path.getChapterBox(DailyMissionActiviyValue.BOX_PNG[i - 1][2]));
                        this._removeBoxFlash(i);
                    } else {
                        UIHelper.loadTexture(boxImage, Path.getChapterBox(DailyMissionActiviyValue.BOX_PNG[i - 1][1]))
                        this._createBoxEffect(i);
                    }
                } else {
                    progress += Math.max(0, 0.33 * (userData.lv - needLvs[i - 1]) / (needLv - needLvs[i - 1]));
                    UIHelper.loadTexture(boxImage, Path.getChapterBox(DailyMissionActiviyValue.BOX_PNG[i - 1][0]))
                }
            }
            this._btnShare.node.active = this._imagehead.node.active = this._txtServer.node.active = true;
            this._txtName.string =  (userData.weixin_name || userData.name) + " LV." + userData.lv ;
            this._txtServer.string = "S" + (userData.sid % 500100000) + " " + userData.server_name;
            if (userData.weixin_head_url) {
                cc.assetManager.loadRemote(userData.weixin_head_url, { ext: '.jpg' }, (err, texture) => {
                    this._imagehead.spriteFrame = new cc.SpriteFrame(texture);
                })
            } else {
                var head = userData.head_pic;
                if (head > 1000) {
                    let avatarConfig = AvatarDataHelper.getAvatarConfig(head);
                    head = avatarConfig.hero_id;
                }
                var itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, head, null, null);
                if (itemParams.icon_bg != null) {
                    UIHelper.loadTexture(this._imagehead, itemParams.icon);
                }
            }
            this._progress.progress = Math.min(1, progress);
        }else {
            for (var i = 1; i <= 3; i++) {
                UIHelper.loadTexture(this["_boxImage" + i], Path.getChapterBox(DailyMissionActiviyValue.BOX_PNG[i - 1][0]))
            }
            this._txtName.string = '没有邀请玩家';
            this._btnShare.node.active = this._imagehead.node.active = this._txtServer.node.active = false;
            this._progress.progress = 0;
        }

    }

    onBoxClick(sender, i) {
        var cfg = G_ConfigLoader.getConfig(ConfigNameConst.SHARE_REWARD).get(i);
        if (this._data && this.data.lv >= cfg.parameter) {
            var hasGetReward = this._data.have_award_id.indexOf(i) != -1;
            if (!hasGetReward) {
                G_UserData.getShareReward().c2sGetInviteUserLvAward(this._data.invited_uid, i);
            }
        } else {
            var rewards = [];
            for (var j = 1; j <= 4; j++) {
                if (cfg["reward_type" + j]) {
                    var item = {
                        type: cfg["reward_type" + j],
                        value: cfg["reward_value" + j],
                        size: cfg["reward_size" + j]
                    };
                    rewards.push(item);
                }
            }
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupReward"), (popup: PopupReward) => {
                popup.setClickOtherClose(true);
                popup.setInitData(Lang.get('daily_task_box'), false, true);
                popup.updateUI(rewards);
                popup.setDetailText("玩家等级达到" + cfg.parameter + "可领取");
                popup.openWithTarget(sender.currentTarget);
            })
        }
    }

    _createBoxEffect(index) {
        if (this._boxEffect[index] || this._boxRedpoint[index]) {
            return;
        }
        var baseNode = this["_boxImage" + index].node;
        if (!baseNode) {
            return;
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(baseNode, 'moving_boxflash', null, null, false);
        this._boxEffect[index] = effect;
        var redPoint = UIHelper.newSprite(Path.getUICommon('img_redpoint'));
        baseNode.addChild(redPoint.node);
        redPoint.node.setPosition(cc.v2(80 / 2, 66 / 2));
        this._boxRedpoint[index] = redPoint;
    }
    _removeBoxFlash(index) {
        if (this._boxEffect[index]) {
            this._boxEffect[index].node.destroy();
            this._boxEffect[index] = null;
        }
        if (this._boxRedpoint[index]) {
            this._boxRedpoint[index].node.destroy();
            this._boxRedpoint[index] = null;
        }
    }

}