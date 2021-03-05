const { ccclass, property } = cc._decorator;

import { ComplexRankConst } from '../../../const/ComplexRankConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground';
import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode';
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import CommonListItem from '../../../ui/component/CommonListItem';
import CommonListView from '../../../ui/component/CommonListView';
import CommonTabGroupScrollVertical from '../../../ui/component/CommonTabGroupScrollVertical';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import { ComplexRankHelper } from './ComplexRankHelper';

@ccclass
export default class ComplexRankView extends ViewBase {

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelbk: cc.Node = null;

    @property({
        type: CommonFullScreen,
        visible: true
    })
    _commonFullScreen: CommonFullScreen = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _listViewPanel: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _listViewTab1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _listViewRootNode: cc.Node = null;


    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _nodeEmpty: CommonEmptyListNode = null;

    @property({
        type: CommonTabGroupScrollVertical,
        visible: true
    })
    _nodeTabRoot: CommonTabGroupScrollVertical = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_my_rank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_my_rank_num: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_my_des: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_my_des_num: cc.Label = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _tabListView: CommonListView = null;





    protected preloadResList = [
        { path: Path.getPrefab("ComplexRankItemCell", "complexRank"), type: cc.Prefab }
    ]
    private _myData: any = {};
    private _tabIndex: number = 0;
    private _dataList: any = {};
    private _complexRankView: any;
    private _selectTabIndex: number;

    private _signalGetUserLevelRank: any;
    private _signalGetUserPowerRank: any;
    private _signalGetArenaTopInfo: any;
    private _signalGetStageStarRank: any;
    private _signalGetEliteStarRank: any;
    private _signalGetTowerStarRank: any;
    private _signalGetGuildRank: any;
    private _signalGetActivePhotoRank: any;
    private _signalGetUserAvaterPhotoRank: any;

    private _enterRankType:number

    setInitData(rankType:number) {
        this._enterRankType = rankType;
    }

    onLoad(){
        if(this._enterRankType==null)
        this._enterRankType = G_SceneManager.getViewArgs("complexRank")[0];
        this._myData = {};
        this._tabIndex = -1;
        this._dataList = {};
        this._complexRankView = {};
        this._selectTabIndex = 0;
        if (this._enterRankType) {
            this._selectTabIndex = ComplexRankHelper.getTabIndexByRankType(this._enterRankType);
        }
        super.onLoad();
    }
    onCreate() {
        this.setSceneSize();
        this._topbarBase.setImageTitle('txt_sys_com_paihangbang');
        this._commonFullScreen.setTitle(Lang.get('complex_rank_title'));
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        var tabNameList = ComplexRankHelper.getComplexTab()[0];
        var param = {
            rootNode: this._listViewRootNode,
            callback: handler(this, this._onTabSelect1),
            containerStyle: 2,
            textList: tabNameList
        };
        this._nodeTabRoot.recreateTabs(param);
    }
    onEnter() {
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.addGetUserBaseInfoEvent();
        this._signalGetUserLevelRank = G_SignalManager.add(SignalConst.EVENT_COMPLEX_LEVEL_RANK, handler(this, this._onEventGetUserLevelRank));
        this._signalGetUserPowerRank = G_SignalManager.add(SignalConst.EVENT_COMPLEX_POWER_RANK, handler(this, this._onEventGetUserPowerRank));
        this._signalGetArenaTopInfo = G_SignalManager.add(SignalConst.EVENT_COMPLEX_ARENA_RANK, handler(this, this._onEventGetArenaTopInfo));
        this._signalGetStageStarRank = G_SignalManager.add(SignalConst.EVENT_COMPLEX_STAGE_STAR_RANK, handler(this, this._onEventGetStageStarRank));
        this._signalGetEliteStarRank = G_SignalManager.add(SignalConst.EVENT_COMPLEX_ELITE_STAR_RANK, handler(this, this._onEventGetEliteStarRank));
        this._signalGetTowerStarRank = G_SignalManager.add(SignalConst.EVENT_COMPLEX_TOWER_STAR_RANK, handler(this, this._onEventGetTowerStarRank));
        this._signalGetGuildRank = G_SignalManager.add(SignalConst.EVENT_COMPLEX_GUILD_RANK, handler(this, this._onEventGetGuildRank));
        this._signalGetActivePhotoRank = G_SignalManager.add(SignalConst.EVENT_COMPLEX_ACTIVE_PHOTO_RANK, handler(this, this._onEventGetActivePhotoRank));
        this._signalGetUserAvaterPhotoRank = G_SignalManager.add(SignalConst.EVENT_COMPLEX_USER_AVATAR_PHOTO_RANK,handler(this,this._onEventGetUserAvaterPhotoRank))
        this._nodeTabRoot.setTabIndex(this._selectTabIndex);
    }
    onExit() {
        this._signalGetUserLevelRank.remove();
        this._signalGetUserLevelRank = null;
        this._signalGetUserPowerRank.remove();
        this._signalGetUserPowerRank = null;
        this._signalGetArenaTopInfo.remove();
        this._signalGetArenaTopInfo = null;
        this._signalGetStageStarRank.remove();
        this._signalGetStageStarRank = null;
        this._signalGetEliteStarRank.remove();
        this._signalGetEliteStarRank = null;
        this._signalGetTowerStarRank.remove();
        this._signalGetTowerStarRank = null;
        this._signalGetGuildRank.remove();
        this._signalGetGuildRank = null;
        this._signalGetActivePhotoRank.remove();
        this._signalGetActivePhotoRank = null;
        this._signalGetUserAvaterPhotoRank.remove();
        this._signalGetUserAvaterPhotoRank = null;
    }
    private _lastIndex:number = -1;
    _updateListView(index) {
        var isSame = index == this._lastIndex;
        var rankType = ComplexRankHelper.getRankTypeByTabIndex(index);
        var dataList = this._dataList[rankType] || {};
        this._lastIndex = index;
        if(this._tabListView.isHasLoaded()==false||isSame==false)
        {
            this._tabListView.spawnCount = 6;
            this._tabListView.init(cc.instantiate(cc.resources.get(Path.getPrefab("ComplexRankItemCell","complexRank"))), handler(this, this._onItemUpdate),
            handler(this, this._onItemSelected), handler(this, this._onItemTouch))
            this._tabListView.setData(dataList.length,0,true,true);
            
        }
        else
        {
            this._tabListView.setData(dataList.length,0,true,true);
        }
        this._updateMyData(this._tabIndex);
        this._nodeEmpty.node.active = (dataList.length <= 0);
    }
    _onTabSelect1(index, sender) {
        if (this._tabIndex == index) {
            return;
        }
        this._selectTabIndex = index;
        this._tabIndex = index;
        var rankType = ComplexRankHelper.getRankTypeByTabIndex(this._tabIndex);
        if (this._dataList[rankType] == null) {
            G_UserData.getComplexRank().c2sGetUserRankByType(rankType);
        } else {
            this._updateListView(this._tabIndex);
        }
    }
    _getSelectItemList() {
        var rankType = ComplexRankHelper.getRankTypeByTabIndex(this._tabIndex);
        return this._dataList[rankType];
    }
    _onItemUpdate(item: CommonListItem, index) {
        var itemList = this._getSelectItemList();
        var data = itemList[index];
        var rankType = ComplexRankHelper.getRankTypeByTabIndex(this._tabIndex);
        item.updateItem(index, data != null ? [data, rankType] : null, rankType);
    }
    refreshView() {
    }
    _onItemSelected(item, index) {
        var itemList = this._getSelectItemList();
        var itemData = itemList[index];
        var rankType = ComplexRankHelper.getRankTypeByTabIndex(this._tabIndex);
        if (itemData && rankType != ComplexRankConst.USER_GUILD_RANK) {
            G_UserData.getBase().c2sGetUserBaseInfo(itemData.userId);
        }
    }
    _onItemTouch(index, touchTag) {
        
    }
    _onEventGetUserLevelRank(id, message) {
        var [rankList, myData] = ComplexRankHelper.covertServerData(id, message);
        this._dataList[ComplexRankConst.USER_LEVEL_RANK] = rankList;
        this._updateMyRankData(myData);
    }
    _onEventGetUserPowerRank(id, message) {
        var [rankList, myData] = ComplexRankHelper.covertServerData(id, message);
        this._dataList[ComplexRankConst.USER_POEWR_RANK] = rankList;
        this._updateMyRankData(myData);
    }
    _onEventGetArenaTopInfo(id, message) {
        var [rankList, myData] = ComplexRankHelper.covertServerData(id, message);
        this._dataList[ComplexRankConst.USER_ARENA_RANK] = rankList;
        this._updateMyRankData(myData);
    }
    _onEventGetStageStarRank(id, message) {
        var [rankList, myData] = ComplexRankHelper.covertServerData(id, message);
        this._dataList[ComplexRankConst.STAGE_STAR_RANK] = rankList;
        this._updateMyRankData(myData);
    }
    _onEventGetEliteStarRank(id, message) {
        var [rankList, myData] = ComplexRankHelper.covertServerData(id, message);
        this._dataList[ComplexRankConst.ELITE_STAR_RANK] = rankList;
        this._updateMyRankData(myData);
    }
    _onEventGetTowerStarRank(id, message) {
        var [rankList, myData] = ComplexRankHelper.covertServerData(id, message);
        this._dataList[ComplexRankConst.TOWER_STAR_RANK] = rankList;
        this._updateMyRankData(myData);
    }
    _onEventGetGuildRank(id, message) {
        var [rankList, myData] = ComplexRankHelper.covertServerData(id, message);
        this._dataList[ComplexRankConst.USER_GUILD_RANK] = rankList;
        this._updateMyRankData(myData);
    }
    _onEventGetActivePhotoRank(id, message) {
        var [rankList, myData] = ComplexRankHelper.covertServerData(id, message);
        this._dataList[ComplexRankConst.ACTIVE_PHOTO_RANK] = rankList;
        this._updateMyRankData(myData);
    }
    _onEventGetUserAvaterPhotoRank(id, message) {
        var [rankList, myData] = ComplexRankHelper.covertServerData(id, message);
        this._dataList[ComplexRankConst.AVATAR_PHOTO_RANK] = rankList;
        this._updateMyRankData(myData);
    }
    _updateMyData(tabIndex) {
        var rankType = ComplexRankHelper.getRankTypeByTabIndex(tabIndex);
        var myData = this._myData[rankType];
        if (myData == null) {
            return;
        }
        if (rankType == ComplexRankConst.USER_LEVEL_RANK) {
            this._updateMyRank(Lang.get('complex_rank_des1'), myData.myRank, Lang.get('complex_rank_arrage_des2'), myData.myLevel);
        }
        if (rankType == ComplexRankConst.USER_POEWR_RANK || rankType == ComplexRankConst.USER_ARENA_RANK) {
            this._updateMyRank(Lang.get('complex_rank_des1'), myData.myRank, Lang.get('complex_rank_arrage_des1'), TextHelper.getAmountText(myData.myPower));
        }
        if (rankType == ComplexRankConst.USER_GUILD_RANK) {
            this._updateMyRank(Lang.get('complex_rank_des2'), myData.myRank, Lang.get('complex_rank_arrage_des4'), myData.myGuildLevel);
        }
        if (rankType == ComplexRankConst.STAGE_STAR_RANK || rankType == ComplexRankConst.ELITE_STAR_RANK || rankType == ComplexRankConst.TOWER_STAR_RANK) {
            this._updateMyRank(Lang.get('complex_rank_des1'), myData.myRank, Lang.get('complex_rank_arrage_des3'), myData.myStar);
        }
        if (rankType == ComplexRankConst.ACTIVE_PHOTO_RANK) {
            this._updateMyRank(Lang.get('complex_rank_des1'), myData.myRank, Lang.get('complex_rank_arrage_des5'), myData.user_photocount);
        }
        if (rankType == ComplexRankConst.AVATAR_PHOTO_RANK) {
            this._updateMyRank(Lang.get('complex_rank_des1'), myData.myRank, Lang.get('complex_rank_arrage_des5'), myData.avaterNum);
        }
    }
    _updateMyRank(rankDes, rank, valuedes, value) {
        Util.updateLabel(this._text_my_rank, rankDes);
        Util.updateLabel(this._text_my_rank_num, rank);
        var label1 = Util.updateLabel(this._text_my_des, valuedes);
        label1["_updateRenderData"](true)
        var label2 = Util.updateLabel(this._text_my_des_num, value);
        label2.node.x = (label1.node.x + label1.node.getContentSize().width + 3);
    }
    _updateMyRankData(myData) {
        var rankType = ComplexRankHelper.getRankTypeByTabIndex(this._tabIndex);
        this._myData[rankType] = myData;
        this._updateListView(this._tabIndex);
    }


}