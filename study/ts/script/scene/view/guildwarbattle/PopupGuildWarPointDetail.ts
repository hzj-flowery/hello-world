const { ccclass, property } = cc._decorator;

import CommonNormalLargeWithChatPop from '../../../ui/component/CommonNormalLargeWithChatPop'
import PopupBase from '../../../ui/PopupBase';
import CommonPageViewIndicator from '../../../ui/component/CommonPageViewIndicator';
import { handler } from '../../../utils/handler';
import { GuildWarDataHelper } from '../../../utils/data/GuildWarDataHelper';
import { SignalConst } from '../../../const/SignalConst';
import { G_SignalManager, G_UserData } from '../../../init';
import { GuildWarCheck } from '../../../utils/logic/GuildWarCheck';
import { clone } from '../../../utils/GlobleFunc';
import GuildWarAvatarItem from './GuildWarAvatarItem';
import { Util } from '../../../utils/Util';
import { Lang } from '../../../lang/Lang';

@ccclass
export default class PopupGuildWarPointDetail extends PopupBase {

    @property({
        type: CommonNormalLargeWithChatPop,
        visible: true
    })
    _popBase: CommonNormalLargeWithChatPop = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttomLeftPage: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttomRightPage: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _pageView: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLeftPage: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRightPage: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMyNum: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOtherNum: cc.Label = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _imageProgressBg: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPercent: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBuildHpTitle: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeOtherAvatarParent: cc.Node = null;

    @property({
        type: CommonPageViewIndicator,
        visible: true
    })
    _commonPageViewIndicator: CommonPageViewIndicator = null;


    public static MY_AVATAR_NUM = 3;
    public static AVATAR_NUM_PER_PAGE = 8;
    public static AVATAR_COLUMN = 4;
    public static AVATAR_POSITION_INFO = {
        gapW: 132,
        gapH: 166
    };
    _pageNum: number;
    _cityId: any;
    _pointId: any;
    _sameGuildWarUserList: any[];
    _otherGuildWarUserList: any[];
    _currPageIndex: number;
    _myAvatarNodeList: any[];
    _otherAvatarNodeList: any[];
    _reportInfo: any;
    _signalGuildWarBattleInfoSyn: any;
    _signalGuildWarReportNotice: any;
    initData(cityId, pointId) {
        this._cityId = cityId;
        this._pointId = pointId;
        this._sameGuildWarUserList = [];
        this._otherGuildWarUserList = [];
        this._currPageIndex = 0;
        this._pageNum = 0;
        this._pageView = null;
        this._commonPageViewIndicator = null;
        this._buttomLeftPage = null;
        this._buttomRightPage = null;
        this._textLeftPage = null;
        this._textRightPage = null;
        this._textMyNum = null;
        this._textOtherNum = null;
        this._imageProgressBg = null;
        this._textPercent = null;
        this._textBuildHpTitle = null;
        this._nodeOtherAvatarParent = null;
        this._myAvatarNodeList = [];
        this._otherAvatarNodeList = [];
        this._reportInfo = null;
    }
    onCreate() {
        var config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(this._cityId, this._pointId);
        var name = config.name;
        this._popBase.setTitle(Lang.get(name));
        this._popBase.addCloseEventListener(handler(this, this._onCloseClick));
        this._createMyAvatars();
        this._createOtherAvatars();
    }
    onEnter() {
        this._refreshView();
        this._signalGuildWarBattleInfoSyn = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_SYN, handler(this, this._onEventGuildWarBattleInfoSyn));
        this._signalGuildWarReportNotice = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_REPORT_NOTICE, handler(this, this._onEventGuildWarReportNotice));
    }
    _onEventGuildWarBattleInfoSyn(event) {
        this._refreshView();
    }
    _onEventGuildWarReportNotice(event, message) {
    }
    onExit() {
        if (this._signalGuildWarBattleInfoSyn) {
            this._signalGuildWarBattleInfoSyn.remove();
            this._signalGuildWarBattleInfoSyn = null;
        }
        if (this._signalGuildWarReportNotice) {
            this._signalGuildWarReportNotice.remove();
            this._signalGuildWarReportNotice = null;
        }
    }
    _onCloseClick() {
        this.closeWithAction();
    }
    _refreshView() {
        this._refreshOtherAvatars();
        this._refreshMyAvatars();
        this._refreshPopulation();
        this._refreshBuildHp();
    }
    onBtnLeftPage(render) {
        if (this._currPageIndex > 1) {
            this._currPageIndex = this._currPageIndex - 1;
            this._commonPageViewIndicator.setCurrentPageIndex(this._currPageIndex - 1);
            this._refreshPageBtn();
            this._updatePageView();
        }
    }
    onBtnRightPage(render) {
        if (this._currPageIndex < this._pageNum) {
            this._currPageIndex = this._currPageIndex + 1;
            this._commonPageViewIndicator.setCurrentPageIndex(this._currPageIndex - 1);
            this._refreshPageBtn();
            this._updatePageView();
        }
    }
    _onHeroClick(warUserData) {
        var success = GuildWarCheck.guildWarCanAttackUser(this._cityId, warUserData, true);
        if (success) {
            var myGuildWarUser = G_UserData.getGuildWar().getMyWarUser(this._cityId);
            this._reportInfo = {
                attackUser: clone(myGuildWarUser),
                beAttackUser: clone(warUserData)
            };
            var userId = warUserData.getUser_id();
            G_UserData.getGuildWar().c2sGuildWarBattleUser(userId);
        }
    }
    _createOtherAvatars() {
        for (var i = 1; i <= PopupGuildWarPointDetail.AVATAR_NUM_PER_PAGE; i += 1) {
            let cell = Util.getNode("prefab/guildwarbattle/GuildWarAvatarItem", GuildWarAvatarItem) as GuildWarAvatarItem;
            cell.setHeroClickCallback(handler(this, this._onHeroClick));
            var col = (i - 1) % PopupGuildWarPointDetail.AVATAR_COLUMN + 1;
            var row = Math.ceil(i / PopupGuildWarPointDetail.AVATAR_COLUMN);
            var x = (col - 1) * PopupGuildWarPointDetail.AVATAR_POSITION_INFO.gapW;
            var y = -(row - 1) * PopupGuildWarPointDetail.AVATAR_POSITION_INFO.gapH;
            cell.node.setPosition(x, y);
            this._nodeOtherAvatarParent.addChild(cell.node);
            this._otherAvatarNodeList.push(cell.node);
        }
    }
    _refreshOtherAvatars() {
        this._otherGuildWarUserList = G_UserData.getGuildWar().getOtherGuildWarUserList(this._cityId, this._pointId, null);
        var pageNum = Math.ceil(this._otherGuildWarUserList.length / PopupGuildWarPointDetail.AVATAR_NUM_PER_PAGE);
        pageNum = Math.max(pageNum, 1);
        if (this._currPageIndex == 0) {
            this._currPageIndex = 1;
        } else if (this._currPageIndex > pageNum) {
            this._currPageIndex = 1;
        }
        this._commonPageViewIndicator.refreshPageData(null, pageNum, this._currPageIndex - 1, 14);
        this._pageNum = pageNum;
        this._commonPageViewIndicator.setCurrentPageIndex(this._currPageIndex - 1);
        this._updatePageView();
        this._refreshPageBtn();
    }
    _updatePageView() {
        var startIndex = (this._currPageIndex - 1) * PopupGuildWarPointDetail.AVATAR_NUM_PER_PAGE + 1;
        for (var k in this._otherAvatarNodeList) {
            var v = this._otherAvatarNodeList[k];
            var data = this._otherGuildWarUserList[startIndex + parseInt(k) - 1];
            if (data) {
                v.setVisible(true);
                v.updateInfo(data);
            } else {
                v.setVisible(false);
            }
        }
    }
    _refreshPageBtn() {
        this._buttomLeftPage.node.active = (this._currPageIndex > 1);
        this._buttomRightPage.node.active = (this._currPageIndex < this._pageNum);
        this._textLeftPage.node.active = (this._currPageIndex > 1);
        this._textRightPage.node.active = (this._currPageIndex < this._pageNum);
    }
    _createMyAvatars() {
        for (var i = 1; i <= PopupGuildWarPointDetail.MY_AVATAR_NUM; i += 1) {
            let cell = Util.getNode("prefab/guildwarbattle/GuildWarAvatarItem", GuildWarAvatarItem) as GuildWarAvatarItem;
            var parentNode = this['_myAvatarNode' + i];
            parentNode.addChild(cell.node);
            this._myAvatarNodeList.push(cell.node);
        }
    }
    _refreshMyAvatars() {
        this._sameGuildWarUserList = G_UserData.getGuildWar().getSameGuildWarUserList(this._cityId, this._pointId, null);
        for (var i = 1; i <= PopupGuildWarPointDetail.MY_AVATAR_NUM; i += 1) {
            var myAvatarNode = this._myAvatarNodeList[i];
            var data = this._sameGuildWarUserList[i];
            if (myAvatarNode) {
                if (data) {
                    myAvatarNode.setVisible(true);
                    myAvatarNode.updateInfo(data);
                    myAvatarNode.turnBack(false);
                } else {
                    myAvatarNode.setVisible(false);
                }
            }
        }
    }
    _refreshPopulation() {
        var num1 = GuildWarDataHelper.calculatePopulation(this._cityId, this._pointId), num2;
        this._textMyNum.string = ((num1) + "");
        this._textOtherNum.string = ((num2) + "");
    }
    _refreshBuildHp() {
        var config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(this._cityId, this._pointId);
        var showHp = config.build_hp > 0;
        this._textBuildHpTitle.node.active = (showHp);
        this._imageProgressBg.node.active = (showHp);
        if (!showHp) {
            return;
        }
        var maxHp = config.build_hp;
        var hp = maxHp;
        var nowWarWatch = G_UserData.getGuildWar().getWarWatchById(this._cityId, this._pointId);
        if (nowWarWatch) {
            hp = nowWarWatch.getWatch_value();
        }
        this._textBuildHpTitle.string = (Lang.get('guildwar_build_hp_title', { name: config.name }));
        this._imageProgressBg.progress = (hp / maxHp);
        this._textPercent.string  =(Lang.get('guildwar_building_hp', {
            min: hp,
            max: maxHp
        }));
    }

}