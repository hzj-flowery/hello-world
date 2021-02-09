const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../utils/handler';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { Path } from '../../../utils/Path';
import ViewBase from '../../ViewBase';
import CommonChatMiniNode from '../chat/CommonChatMiniNode';
import PopupSiegeRank from './PopupSiegeRank';
import { SiegeHelper } from './SiegeHelper';
import SiegeNode from './SiegeNode';
import SiegeScene from './SiegeScene';





@ccclass
export default class SiegeView extends ViewBase {

    @property({ type: cc.ScrollView, visible: true })
    _scrollScene: cc.ScrollView = null;
    @property({ type: CommonTopbarBase, visible: true })
    _topBar: CommonTopbarBase = null;
    @property({ type: CommonMainMenu, visible: true })
    _btnShop: CommonMainMenu = null;
    @property({ type: CommonMainMenu, visible: true })
    _btnReward: CommonMainMenu = null;
    @property({ type: CommonMainMenu, visible: true })
    _btnRank: CommonMainMenu = null;
    @property({ type: cc.Label, visible: true })
    _textCropReward: cc.Label = null;
    @property({ type: CommonResourceInfo, visible: true })
    _rewardCrop: CommonResourceInfo = null;
    @property({ type: cc.Label, visible: true })
    _textRankCrop: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textReward: cc.Label = null;
    @property({ type: CommonResourceInfo, visible: true })
    _rewardPersonal: CommonResourceInfo = null;
    @property({ type: cc.Label, visible: true })
    _textRankPersonal: cc.Label = null;
    @property({ type: CommonHelpBig, visible: true })
    _btnRule: CommonHelpBig = null;
    @property({ type: CommonMainMenu, visible: true })
    _btnShareAll: CommonMainMenu = null;
    @property({ type: CommonMainMenu, visible: true })
    _btnTakeAll: CommonMainMenu = null;
    @property({ type: CommonChatMiniNode, visible: true })
    _commonChat: CommonChatMiniNode = null;

    private static PAGE_NUM = 3;	//每一页有3个对手
    private static REWARD_TYPE_GUILD = 1;		//军团奖励
    private static REWARD_TYPE_PERSON = 2;	//玩家奖励

    private _nodes: SiegeNode[] = [];
    private _rankReward;
    private _rankGuildReward;
    private _signalShare;
    private _signalBoxReward;
    private _signalRedPointUpdate;
    private _signalGetRebelArmy;
    private _btnPageUp;
    private _btnPageDown;
    private _scene: SiegeScene;

    private _siegeNodePrefab: cc.Prefab;

    protected preloadResList = [
        { type: cc.Prefab, path: Path.getPrefab("SiegeNode", "siege") }
    ];

    public static waitEnterMsg(callback) {
        function onMsgCallBack() {
            callback();
            signal.remove();
        }
        G_UserData.getSiegeData().refreshRebelArmy(true)
        let signal = G_SignalManager.add(SignalConst.EVENT_REBEL_ARMY, onMsgCallBack);
    }

    public onCreate() {
        this.setSceneSize();
        this._siegeNodePrefab = cc.resources.get(Path.getPrefab("SiegeNode", "siege"), cc.Prefab);

        this._topBar.setImageTitle('txt_sys_com_nanmanruqin');
        this._topBar.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._btnReward.updateUI(FunctionConst.FUNC_SIEGE_REWARD);
        this._btnShop.updateUI(FunctionConst.FUNC_SIEGE_SHOP);
        this._btnRank.updateUI(FunctionConst.FUNC_REBEL_RANK);
        this._btnRule.updateUI(FunctionConst.FUNC_PVE_SIEGE);
        this._btnTakeAll.updateUI(FunctionConst.FUNC_SIEGE_GET_ALL);
        this._btnTakeAll.node.active = false;
        this._btnShareAll.updateUI(FunctionConst.FUNC_SIEGE_SHARE_ALL);
        this._btnShareAll.node.active = false;
        this._scene = new cc.Node("_SiegeScene").addComponent(SiegeScene);
        var innerContainer = this._scrollScene.content;
        innerContainer.addChild(this._scene.node);
        this._scrollScene.content.setContentSize(this._scene.getWidth(), 640);
    }

    public onEnter() {
        this._signalShare = G_SignalManager.add(SignalConst.EVENT_SIEGE_SHARE, handler(this, this._onEventSiegeShare));
        this._signalBoxReward = G_SignalManager.add(SignalConst.EVENT_SIEGE_BOX_REWARD, handler(this, this._onEventSiegeBox));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalGetRebelArmy = G_SignalManager.add(SignalConst.EVENT_REBEL_ARMY, handler(this, this._onEventRebelArmy));
        var takeVisible = FunctionCheck.funcIsShow(FunctionConst.FUNC_SIEGE_GET_ALL);
        this._btnTakeAll.node.active = (takeVisible);
        var shareVisible = FunctionCheck.funcIsShow(FunctionConst.FUNC_SIEGE_SHARE_ALL);
        this._btnShareAll.node.active = (shareVisible);
        this._refreshTakeAllBtn();
        this._refreshRankInfo();
        this._refreshRedPoint();
        this._refreshEnemy();
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "SiegeView");
    }

    public onExit() {
        this._signalShare.remove();
        this._signalShare = null;
        this._signalBoxReward.remove();
        this._signalBoxReward = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalGetRebelArmy.remove();
        this._signalGetRebelArmy = null;
    }

    private _removeNodes() {
        for (let i = 0; i < this._nodes.length; i++) {
            this._nodes[i].node.removeFromParent();
        }
        this._nodes = [];
    }

    private _onEventRedPointUpdate(event, funcId, param) {
        if (funcId == FunctionConst.FUNC_PVE_SIEGE) {
            this._refreshRedPoint();
        }
    }

    private _onEventHurtReward() {
        this._refreshRedPoint();
    }

    private _refreshRedPoint() {
        var showRedPoint = G_UserData.getSiegeData().canGetRewards();
        this._btnReward.showRedPoint(showRedPoint);
    }

    private _refreshRankInfo() {
        this._refreshMyRankPanel();
        this._refreshGuildRankPanel();
    }

    private _refreshMyRankPanel() {
        var myRank = G_UserData.getSiegeData().getUserRank();
        if (myRank == 0) {
            this._textRankPersonal.string = (Lang.get('siege_rank_no_rank'));
            this._textReward.string = (Lang.get('siege_rank_no_reward'));
            this._rewardPersonal.node.active = false;
        } else {
            this._textRankPersonal.string = (myRank).toString();
            var reward = SiegeHelper.getRankReward(SiegeView.REWARD_TYPE_PERSON, myRank);
            if (reward) {
                this._rewardPersonal.updateUI(reward.type, reward.value, reward.size);
                this._rewardPersonal.setTextColorToDTypeColor();
                this._textReward.string = (Lang.get('siege_rank_reward'));
                this._rewardPersonal.node.active = true;
            }
            this._rankReward = reward;
        }
    }

    private _refreshGuildRankPanel() {
        var guildRank = G_UserData.getSiegeData().getUserGuildRank();
        if (guildRank == 0) {
            this._textRankCrop.string = (Lang.get('siege_rank_no_rank'));
            this._rewardCrop.node.active = false;
            this._textCropReward.string = (Lang.get('siege_rank_no_reward'));
        } else {
            this._textRankCrop.string = (guildRank).toString();
            var reward = SiegeHelper.getRankReward(SiegeView.REWARD_TYPE_GUILD, guildRank);
            if (reward) {
                this._rewardCrop.updateUI(reward.type, reward.value, reward.size);
                this._rewardCrop.setTextColorToDTypeColor();
                this._rewardCrop.node.active = true;
                this._textCropReward.string = (Lang.get('siege_rank_reward'));
            }
            this._rankGuildReward = reward;
        }
    }

    private _fixScrollViewSize() {
        var pos = this._scrollScene.content.position;
        var width = this._scene.getWidth();
        this._scrollScene.content.setContentSize(width, 640);
        if (pos.x < -1 * width) {
            pos.x = -1 * width;
        }
        this._scrollScene.content.setPosition(pos);
    }

    private _refreshEnemy() {
        if (this._siegeNodePrefab == null) {
            return;
        }
        var enemyList = G_UserData.getSiegeData().getSiegeEnemys();
        var curNodeNum = this._nodes.length;
        var curEnemyNum = enemyList.length;
        if (curEnemyNum == curNodeNum) {
            for (let i in this._nodes) {
                let v = this._nodes[i];
                v.refreshSiege();
            }
        } else if (curEnemyNum > curNodeNum) {
            for (let i in this._nodes) {
                let v = this._nodes[i];
                v.refreshSiege();
            }
            for (let i = curNodeNum; i < curEnemyNum; i++) {
                let d = enemyList[i];
                let siegeNode = cc.instantiate(this._siegeNodePrefab).getComponent(SiegeNode);
                siegeNode.init(d.getUid(), d.getId());
                this._scene.addNode(siegeNode.node);
                this._nodes.push(siegeNode);
            }
            this._fixScrollViewSize();
        } else {
            this._scene.reset();
            this._nodes = [];
            for (let i in enemyList) {
                let v = enemyList[i];
                var siegeNode = cc.instantiate(this._siegeNodePrefab).getComponent(SiegeNode);
                siegeNode.init(v.getUid(), v.getId());
                this._scene.addNode(siegeNode.node);
                this._nodes.push(siegeNode);
            }
            this._fixScrollViewSize();
        }
    }

    public onRewardClick() {
        if (G_UserData.getSiegeData().isExpired()) {
            G_UserData.getSiegeData().refreshRebelArmy();
            return;
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupHurtReward", "siege"));
    }

    private _onEventSiegeBox(eventName, rewards) {
        this._refreshEnemy();
        this._refreshTakeAllBtn();
        PopupGetRewards.showRewards(rewards);
    }

    private _refreshTakeAllBtn() {
        if (!G_UserData.getSiegeData().haveNotTakedAward()) {
            this._btnTakeAll.loadCustomIcon(Path.getCommonIcon('common', 'baoxiang_jubaopeng_kong'));
            this._btnTakeAll.stopFuncGfx();
        } else {
            this._btnTakeAll.loadCustomIcon(Path.getCommonIcon('common', 'img_mapbox_guan'));
            this._btnTakeAll.playFuncGfx();
        }
    }

    public onRankClick() {
        if (G_UserData.getSiegeData().isExpired()) {
            G_UserData.getSiegeData().refreshRebelArmy();
            return;
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupSiegeRank", "siege"), (popupSiegeRank: PopupSiegeRank) => {
            popupSiegeRank.init(this._rankReward, this._rankGuildReward);
            popupSiegeRank.openWithAction();
        })
    }

    private _onEventSiegeShare() {
        G_Prompt.showTip(Lang.get('siege_share_success'));
        this._refreshEnemy();
    }

    public onShopClick() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_SIEGE_SHOP);
    }

    public onBtnShareAll() {
        if (!G_UserData.getGuild().isInGuild()) {
            G_Prompt.showTip(Lang.get('siege_no_guild'));
            return;
        } else {
            var canShare = G_UserData.getSiegeData().isThereArmyCanShare();
            if (canShare) {
                G_UserData.getSiegeData().c2sRebArmyPublicMulti();
            } else {
                G_Prompt.showTip(Lang.get('siege_no_share'));
            }
        }
    }

    public onBtnTakeAll() {
        G_UserData.getSiegeData().c2sRebArmyKillRewardMulti();
    }

    public getSiegeNodeByIndex(index) {
        if (this._nodes.length > 0 && this._nodes[index - 1]) {
            return this._nodes[index - 1];
        }
        return null;
    }

    private _onEventRebelArmy(eventName) {
        this._refreshTakeAllBtn();
        this._refreshEnemy();
    }
}