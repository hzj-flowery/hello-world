import { G_UserData } from "../../../init";
import CommonConst from "../../../const/CommonConst";
import { GuildDataHelper } from "../../../utils/data/GuildDataHelper";
import CommonIconTemplate from "../../../ui/component/CommonIconTemplate";

export default class GuildTaskBoxNodeHelper {
    _target: any;
    _boxItemViews: any[];
    _boxDataList: any[];
    _textCount: cc.Label;
    constructor(target) {
        this._target = target;
        this._textCount = (this._target.getChildByName('TextCount') as cc.Node).getComponent(cc.Label);
        this._boxItemViews = [];
        this._boxDataList = [];
        // cc.bind(target, 'CommonProgressNode');
        this._initBoxView();
    }
    _initBoxView() {
        for (var index = 1; index <= 4; index++) {
            var nodeBox = this._target.getChildByName('NodeBox' + index);
            if (nodeBox) {
                var commonItemIcon = (nodeBox.getChildByName('CommonItemIcon') as cc.Node).getComponent(CommonIconTemplate);
                // cc.bind(commonItemIcon, 'CommonIconTemplate');
                // nodeBox.name = (index);
                this._boxItemViews.push(nodeBox);
            }
        }
    }
    refreshBoxView() {
        var boxDataList = GuildDataHelper.getGuildMissionData();
        this._boxDataList = boxDataList;
        var lastBox = boxDataList[boxDataList.length - 1];
        var guildUnitData = G_UserData.getGuild().getMyGuild();
        var exp = guildUnitData.getDaily_total_exp();
        var maxExp = lastBox ? lastBox.config.need_exp : 0;
        this._textCount.string = (exp.toString());
        // this._target.setPercent(exp, maxExp, 1);
        let processBar = (this._target.getChildByName("LoadingBar") as cc.Node).getComponent(cc.ProgressBar);
        processBar.progress = exp / maxExp >= 1 ? 1 : exp / maxExp;
        // this._target.showLightLine(true, exp, maxExp);
        var userGuildInfo = G_UserData.getGuild().getUserGuildInfo();
        for (let k = 0; k < this._boxItemViews.length; k++) {
            var v = this._boxItemViews[k];
            var boxData = boxDataList[k];
            this._refreshBoxItemView(k, v, boxData);
        }
    }
    _refreshBoxItemView(index, node, boxData) {
        var status = boxData.status;
        var config = boxData.config;
        var dropList = boxData.dropList;
        var reward = dropList[0];
        var text = (node.getChildByName("Text") as cc.Node).getComponent(cc.Label);
        text.string = (config.need_exp.toString());
        var commonItemIcon = (node.getChildByName('CommonItemIcon') as cc.Node).getComponent(CommonIconTemplate) as CommonIconTemplate;
        commonItemIcon.unInitUI();
        commonItemIcon.initUI(reward.type, reward.value, reward.size);
        if (index == 0) {
            commonItemIcon.setCallBack(function (sender, itemParams) {
                this.onClickBox1(node);
            }.bind(this));
        }
        else if (index == 1) {
            commonItemIcon.setCallBack(function (sender, itemParams) {
                this.onClickBox2(node);
            }.bind(this));
        }
        else if (index == 2) {
            commonItemIcon.setCallBack(function (sender, itemParams) {
                this.onClickBox3(node);
            }.bind(this));
        }
        else if (index == 3) {
            commonItemIcon.setCallBack(function (sender, itemParams) {
                this.onClickBox4(node);
            }.bind(this));
        }
        commonItemIcon.setTouchEnabled(true);
        commonItemIcon.setIconSelect(false);
        commonItemIcon.setIconMask(false);
        commonItemIcon.removeLightEffect();
        if (status == CommonConst.BOX_STATUS_ALREADY_GET) {
            commonItemIcon.setIconMask(true);
            commonItemIcon.setIconSelect(true);
        } else if(status == CommonConst.BOX_STATUS_CAN_GET){
                commonItemIcon.showLightEffect();
        }else {

        }
    }
    onClickBox1() {
        var boxData = this._boxDataList[0];
        var rewards = boxData.dropList;
        var status = boxData.status;
        if (status == CommonConst.BOX_STATUS_NOT_GET || status == CommonConst.BOX_STATUS_ALREADY_GET) {
            return;
        }
        G_UserData.getGuild().c2sGetGuildTaskReward(1);
    }
    onClickBox2() {
        var boxData = this._boxDataList[1];
        var rewards = boxData.dropList;
        var status = boxData.status;
        if (status == CommonConst.BOX_STATUS_NOT_GET || status == CommonConst.BOX_STATUS_ALREADY_GET) {
            return;
        }
        G_UserData.getGuild().c2sGetGuildTaskReward(2);
    }
    onClickBox3() {
        var boxData = this._boxDataList[2];
        var rewards = boxData.dropList;
        var status = boxData.status;
        if (status == CommonConst.BOX_STATUS_NOT_GET || status == CommonConst.BOX_STATUS_ALREADY_GET) {
            return;
        }
        G_UserData.getGuild().c2sGetGuildTaskReward(3);
    }
    onClickBox4() {
        var boxData = this._boxDataList[3];
        var rewards = boxData.dropList;
        var status = boxData.status;
        if (status == CommonConst.BOX_STATUS_NOT_GET || status == CommonConst.BOX_STATUS_ALREADY_GET) {
            return;
        }
        G_UserData.getGuild().c2sGetGuildTaskReward(4);
    }
}