import CommonConst from "../../../const/CommonConst";
import { Path } from "../../../utils/Path";
import { GuildDataHelper } from "../../../utils/data/GuildDataHelper";
import { G_UserData } from "../../../init";
import CommonIconTemplate from "../../../ui/component/CommonIconTemplate";
import UIHelper from "../../../utils/UIHelper";
import { ReturnConst } from "../../../const/ReturnConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildContributionBoxNode extends cc.Component {
    public static readonly BOX_IMG = [
        {
            close: 'baoxiangtong_guan',
            open: 'baoxiangtong_kai',
            received: 'baoxiangtong_kong'
        },
        {
            close: 'baoxiangyin_guan',
            open: 'baoxiangyin_kai',
            received: 'baoxiangyin_kong'
        },
        {
            close: 'baoxiang_jubaopeng_guan',
            open: 'baoxiang_jubaopeng_kai',
            received: 'baoxiang_jubaopeng_kong'
        },
        {
            close: 'baoxiangjin_guan',
            open: 'baoxiangjin_kai',
            received: 'baoxiangjin_kong'
        }
    ];

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;

    _boxItemViews: any[];
    _boxDataList: any[];
    _maxExp: number;

    initData() {
        this._boxItemViews = [];
        this._boxDataList = [];
        this._maxExp = 0;
        // cc.bind(target, 'CommonProgressNode');
        this._initBoxView();
    }
    _initBoxView() {
        for (var index = 1; index <= 4; index++) {
            var node = this.node.getChildByName('Node_Box' + index);
            if (node) {
                var commonIcon = node.getChildByName('CommonIcon');
                // cc.bind(commonIcon, 'CommonIconTemplate');
                var panelTouch = node.getChildByName('Panel_Touch');
                // panelTouch.setTag(index);
                // panelTouch.addClickEventListenerEx(handler(this, this._onClickBox));
                this._boxItemViews.push(node);
            }
        }
    }
    refreshBoxView() {
        let res = GuildDataHelper.getGuildContributionBoxData();
        var boxDataList = res[0];
        let exp = res[1];
        let maxExp = res[2];
        this._boxDataList = boxDataList;
        this._maxExp = maxExp;
        exp = Math.min(exp, maxExp);
        var lastBox = boxDataList[boxDataList.length];
        var myGuild = G_UserData.getGuild().getMyGuild();
        var num = myGuild.getDonate_point();
        this._textCount.string = (num.toString());
        var percent = exp / maxExp;
        if (percent <= 0.25) {
            this.setPercent(percent + 0.01, 1, 1);
        }
        else if (percent > 0.25 && percent <= 0.5) {
            this.setPercent(0.43 + 0.01 * maxExp * (percent - 0.25), 1, 1)
        }
        else if (percent > 0.5 && percent <= 0.75) {
            this.setPercent(0.68 + 0.01 * maxExp * (percent - 0.5), 1, 1)
        }
        else if (percent > 0.75 && percent <= 1) {
            this.setPercent(0.93 + 0.01 * maxExp * (percent - 0.75), 1, 1);
        }
        // this.showLightLine(true, exp, maxExp);
        var size = this._boxItemViews.length;
        for (let k = 0; k < this._boxItemViews.length; k++) {
            var v = this._boxItemViews[k];
            var boxData = boxDataList[k];
            this._refreshBoxItemView(v, boxData, k, size);
        }
    }

    private setPercent(percent: number, param1: number, param2: number) {
        var node = this.node.getChildByName("LoadingBar");
        let processBall = node.getComponent(cc.ProgressBar) as cc.ProgressBar;
        processBall.progress = percent;
    }
    _refreshBoxItemView(node, boxData, index, size) {
        var status = boxData.status;
        var config = boxData.config;
        var dropList = boxData.dropList;
        var exp = boxData.exp;
        var reward = dropList[0];
        var commonIcon = (node.getChildByName('CommonIcon') as cc.Node).getComponent(CommonIconTemplate);
        var text = node.getChildByName('Text').getComponent(cc.Label) as cc.Label;
        var image = node.getChildByName('Image').getComponent(cc.Sprite) as cc.Sprite;
        text.string = (exp.toString());
        commonIcon.unInitUI();
        commonIcon.initUI(reward.type, reward.value, reward.size);
        commonIcon.setTouchEnabled(false);
        commonIcon.setIconSelect(false);
        commonIcon.setIconMask(false);
        commonIcon.removeLightEffect();
        var doubleTimes = G_UserData.getReturnData().getPrivilegeRestTimes(ReturnConst.PRIVILEGE_GUILD_CONTRIBUTION);
        // commonIcon.showDoubleTips(doubleTimes > 0);
        var isLast = index == size;
        if (status == CommonConst.BOX_STATUS_ALREADY_GET) {
            commonIcon.setIconMask(true);
            commonIcon.setIconSelect(true);
            UIHelper.loadTexture(image, Path.getGuildRes(isLast ? 'img_jisi04a' : 'img_jisi04b'));
        } else if (status == CommonConst.BOX_STATUS_CAN_GET) {
            commonIcon.showLightEffect();
            UIHelper.loadTexture(image, Path.getGuildRes(isLast ? 'img_jisi04a' : 'img_jisi04b'));
        }
        else {
            UIHelper.loadTexture(image, Path.getGuildRes('img_jisi05'));
        }
    }
    onClickBox1() {
        var boxData = this._boxDataList[0];
        var rewards = boxData.dropList;
        var status = boxData.status;
        if (status == CommonConst.BOX_STATUS_NOT_GET || status == CommonConst.BOX_STATUS_ALREADY_GET) {
            return;
        }
        G_UserData.getGuild().c2sGetGuildDonateReward(1);
    }
    onClickBox2() {
        var boxData = this._boxDataList[1];
        var rewards = boxData.dropList;
        var status = boxData.status;
        if (status == CommonConst.BOX_STATUS_NOT_GET || status == CommonConst.BOX_STATUS_ALREADY_GET) {
            return;
        }
        G_UserData.getGuild().c2sGetGuildDonateReward(2);
    }
    onClickBox3() {
        var boxData = this._boxDataList[2];
        var rewards = boxData.dropList;
        var status = boxData.status;
        if (status == CommonConst.BOX_STATUS_NOT_GET || status == CommonConst.BOX_STATUS_ALREADY_GET) {
            return;
        }
        G_UserData.getGuild().c2sGetGuildDonateReward(3);
    }
    onClickBox4() {
        var boxData = this._boxDataList[3];
        var rewards = boxData.dropList;
        var status = boxData.status;
        if (status == CommonConst.BOX_STATUS_NOT_GET || status == CommonConst.BOX_STATUS_ALREADY_GET) {
            return;
        }
        G_UserData.getGuild().c2sGetGuildDonateReward(4);
    }
}