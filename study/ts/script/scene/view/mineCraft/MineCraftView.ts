const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { BullectScreenConst } from '../../../const/BullectScreenConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { GrainCarConst } from '../../../const/GrainCarConst';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { ReportParser } from '../../../fight/report/ReportParser';
import { G_ConfigLoader, G_Prompt, G_ResolutionManager, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData, G_ConfigManager, G_BulletScreenManager, G_AudioManager } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { assert } from '../../../utils/GlobleFunc';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { table } from '../../../utils/table';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import GrainCarConfigHelper from '../grainCar/GrainCarConfigHelper';
import { GrainCarDataHelper } from '../grainCar/GrainCarDataHelper';
import GrainCarRoute from '../grainCar/GrainCarRoute';
import PopupGrainCar from '../grainCar/PopupGrainCar';
import { PopupHonorTitleHelper } from '../playerDetail/PopupHonorTitleHelper';
import { MineCraftHelper } from './MineCraftHelper';
import MineGetMoneyIcon from './MineGetMoneyIcon';
import MineMoveAvatar from './MineMoveAvatar';
import MineMoveCar from './MineMoveCar';
import MineMoveCarCorpse from './MineMoveCarCorpse';
import MineNode from './MineNode';
import PopupBuyArmy from './PopupBuyArmy';
import PopupMine from './PopupMine';
import PopupMineSweep from './PopupMineSweep';




@ccclass
export default class MineCraftView extends ViewBase {

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollMapBG: cc.ScrollView = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArmyBG: cc.Sprite = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _barArmyR: cc.ProgressBar = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _barArmyY: cc.ProgressBar = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _barArmy: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textSeflArmy: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInfame: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelInfam: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _iconInfame: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnAdd: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeLessArmyInfo: cc.Node = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topBar: CommonTopbarBase = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPeaceMine: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTimePeace: cc.Label = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnReport: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnMyPos: CommonMainMenu = null;

    @property({
        type: CommonHelpBig,
        visible: true
    })
    _btnRule: CommonHelpBig = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnPrivilege: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnGrainCar: CommonMainMenu = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPrivilegeTime: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRP: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRPCount: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRichMine: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGrainCar: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTimeGrainCar: cc.Label = null;

    

    @property({
        type: cc.Prefab,
        visible: true
    })
    _GrainCarRoute: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _MineMoveCar: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _MineMoveCarCorpse: cc.Prefab = null;

    

    
    public static SCALE_AVATAR = 0.5;
    public static AVATAR_POS_FIX = new cc.Vec2(60, -40);

    public static CAR_AVATAR_POS_FIX = cc.v2(60, -40);
    public static CAR_AVATAR_POS_FIX_110 = cc.v2(-60, -140);
    public static CAR_AVATAR_POS_FIX_210 = cc.v2(-60, -40);
    public static CAR_AVATAR_WIDTH = 130;

    public static ACTOR_SPEED = 5;
    public static GET_ICON_Y_FIX = 50;
    public static DIE_TYPE_ENEMY = 1;
    public static DIE_TYPE_SELF = 2;
    public static DIE_TYPE_DOUBLE = 3;
    public static SCROLL_TIME = 0.5;
    public static SCALE_PERCENT = 0.9;
    public static MOVE_AVATAR_MAX = 50;

    public static MINE_ID_UP_MAX = 110;
    public static MINE_ID_LEFT_MAX = 210;
    public static GRANCAR_COUNTDOWN_TITLE_POSX_AFTER2230 = 232;
    public static GRANCAR_COUNTDOWN_LABEL_POSX_AFTER2230 = 50;
    public static GRANCAR_COUNTDOWN_TITLE_POSX_NORMAL = 0;
    public static GRANCAR_COUNTDOWN_LABEL_POSX_NORMAL = 14;
    public static CORPSE_FIX = {
    [1]: cc.v2(50, 10),
    [2]: cc.v2(120, -80),
    [3]: cc.v2(-100, -60),
    [4]: cc.v2(80, 10),
    [5]: cc.v2(-80, 10)
};

    private _mineBaseNode;
    private _mapSize: cc.Size;
    private _signalGetMineWorld;
    private _signalSettleMine;
    private _signalMineRespond;
    private _signalGetMineMoney;
    private _signalBattleMine;
    private _signalReConnect;
    private _signalFastBattle;
    private _signalRedPointUpdate;
    private _signalMineNotice;
    private _signalGetAllMoveCar;
    private _signalGrainCarMoveNotify;
    private _signalGo2Mine;
    private _signalChangeMine2Car;
    private _signalUpdateArmy;
    private _signalGrainCarNotify;


    private _ismoving = false;
    private _outputMoney = 0;
    private _lastUpdate = 0;
    private _lastMineId = 0;
    private _moveAvatars: Array<MineMoveAvatar>;
    private _lastDoubleActionTime = 0;
    private _mines = {};
    private _signalUpdateTitleInfo: any;
    private _scheduleHandler: any;

    private _roads: any;
    private _moveIndex: number;
    private _bezier: Array<any> = [];
    private _maxdistance: number;
    private _distance: number;
    private _positionDelta: cc.Vec2;
    private _startPos: cc.Vec2;
    
    private _grainCarRoute:GrainCarRoute;
    private _grainCarCorpse:cc.Node;
    private _mineGetMoneyIconPrefab: any;
    private _mineGetMoneyIcon: MineGetMoneyIcon;
    private _commonHeroAvatarPrefab: any;
    private _mineNodePrefab: any;
    private _heroAvatarPrefab;
    private _heroAvatar: CommonHeroAvatar;
    private _moveAvatarPrefab: any;
    private _scheduleGrainCarHandler;

    protected preloadResList = [
        {path:Path.getPrefab("MineGetMoneyIcon","mineCraft"),type:cc.Prefab},
        {path:Path.getPrefab("MineNode","mineCraft"),type:cc.Prefab},
        {path:Path.getPrefab("MineMoveAvatar","mineCraft"),type:cc.Prefab},
        {path:Path.getPrefab("PopupMineNode","mineCraft"),type:cc.Prefab},
        {path:Path.getPrefab("UserDetailPetSingle","team"),type:cc.Prefab},
        {path:Path.getPrefab("TeamYokeDynamicModule","team"),type:cc.Prefab},
        {path:Path.getPrefab("TeamYokeConditionNode","team"),type:cc.Prefab},
        {path:Path.getPrefab("TeamHeroBustIcon","team"),type:cc.Prefab},
        {path:Path.getPrefab("TeamHeroIcon","team"),type:cc.Prefab},
        {path:Path.getPrefab("TeamPartnerButton","team"),type:cc.Prefab},
        {path:Path.getPrefab("UserDetailHeroNode","team"),type:cc.Prefab},
        {path:Path.getPrefab("UserDetailPetNode","team"),type:cc.Prefab},
        {path:Path.getPrefab("UserYokeNode","team"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonMainMenu"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonDetailTitleWithBg"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonHeroAvatar"),type:cc.Prefab},
        {path:Path.getPrefab("SilkbagIcon","silkbag"),type:cc.Prefab},
        {path:Path.getPrefab("EquipDesJadeIcon","equipment"),type:cc.Prefab},
    ];
    public static waitEnterMsg(callBack) {
        G_UserData.getMineCraftData().clearAllMineUser();
        G_UserData.getMineCraftData().c2sGetMineWorld();
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_GET_MINE_WORLD, callBack);
        return signal;
    }

    constructor() {
        super();
        // this.node.name = "MineCraftView";
    }

    onLoad(): void {
        this._mineBaseNode = null;
        this._heroAvatar = null;
        this._mapSize = cc.size(0, 0);
        this._signalGetMineWorld = null;
        this._signalSettleMine = null;
        this._signalMineRespond = null;
        this._signalGetMineMoney = null;
        this._signalBattleMine = null;
        this._signalReConnect = null;
        this._signalFastBattle = null;
        this._signalRedPointUpdate = null;
        this._signalMineNotice = null;
        this._ismoving = false;
        this._outputMoney = 0;
        this._mineGetMoneyIcon = null;
        this._lastUpdate = 0;
        this._lastMineId = 0;
        this._moveAvatars = [];
        this._lastDoubleActionTime = 0;
        this._mines = {};

        this._mineGetMoneyIconPrefab = cc.resources.get(Path.getPrefab("MineGetMoneyIcon","mineCraft"));
        this._heroAvatarPrefab = cc.resources.get(Path.getCommonPrefab("CommonHeroAvatar"));
        this._mineNodePrefab = cc.resources.get(Path.getPrefab("MineNode","mineCraft"));
        this._moveAvatarPrefab = cc.resources.get(Path.getPrefab("MineMoveAvatar","mineCraft"));
        super.onLoad();
    }
    
    private _curBgm;
    private _focusedMineId;
    private _bOpenGrainCarDonate:boolean = false;
    private _moveCarsHashTable;
    private _corpseAvatar;
    private _frameGrainCar:number;
    ctor(focusMine, openGrainCarDonate){
        this._focusedMineId = focusMine;
        this._bOpenGrainCarDonate = openGrainCarDonate;
        this._curBgm = AudioConst.MUSIC_BGM_NEW_CITY;
        
        this._moveCarsHashTable = {};
        this._corpseAvatar = {};
        this._frameGrainCar = 0;
    }

    onCreate(): void {
        
        this._focusedMineId = G_SceneManager.getViewArgs("mineCraft")[0];
        this._bOpenGrainCarDonate = G_SceneManager.getViewArgs("mineCraft")[1];
        this._curBgm = AudioConst.MUSIC_BGM_NEW_CITY;

        this._moveCarsHashTable = {};
        this._corpseAvatar = {};
        this._frameGrainCar = 0;
        
        this.setSceneSize(null,false);
        //目前没有发现该组件的使用 先隐藏
        this._nodeInfame.active = false;
        this._btnGrainCar.node.active = false;
      
        this._btnPrivilege.node.active = (false);
        this._textPrivilegeTime.node.active = (false);
        this._updatePrivilege();
        this._createMapBG();
        this._createMineNode();
        this._createAvatar();
        this._btnReport.updateUI(FunctionConst.FUNC_MINE_REPORT);
        this._btnMyPos.updateUI(FunctionConst.FUNC_MINE_POS);
        this._btnRule.updateUI(FunctionConst.FUNC_MINE_CRAFT);
        this._btnPrivilege.updateUI(FunctionConst.FUNC_MINE_CRAFT_PRIVILEGE);
        this._btnMyPos.addClickEventListenerEx(handler(this,this.onMineClick));
        this._btnReport.addClickEventListenerEx(handler(this,this._onReportClick));
        this._btnPrivilege.addClickEventListenerEx(handler(this,this._onPrivilege));
        this._btnGrainCar.addClickEventListenerEx(handler(this,this._onGrainCarClick));
        this._btnGrainCar.updateUI(FunctionConst.FUNC_GRAIN_CAR_DONATE);
        if (GrainCarConfigHelper.isTodayOpen() && GrainCarConfigHelper.isInActivityTime()) {
            G_UserData.getGrainCar().c2sGetAllMoveGrainCar();
        }
    }
    onEnter(): void {
        this._signalGetMineWorld = G_SignalManager.add(SignalConst.EVENT_GET_MINE_WORLD, handler(this, this._onEventGetMineWorld));
        this._signalSettleMine = G_SignalManager.add(SignalConst.EVENT_SETTLE_MINE, handler(this, this._onEventSettleMine));
        this._signalMineRespond = G_SignalManager.add(SignalConst.EVENT_GET_MINE_RESPOND, handler(this, this._onEventMineRespond));
        this._signalGetMineMoney = G_SignalManager.add(SignalConst.EVENT_GET_MINE_MONEY, handler(this, this._onEventGetMineMoney));
        this._signalBattleMine = G_SignalManager.add(SignalConst.EVENT_BATTLE_MINE, handler(this, this._onEventBattleMine));
        this._signalReConnect = G_SignalManager.add(SignalConst.EVENT_LOGIN_SUCCESS, handler(this, this._onEventFinishLogin));
        this._signalFastBattle = G_SignalManager.add(SignalConst.EVENT_FAST_BATTLE, handler(this, this._onEventFastBattle));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalMineNotice = G_SignalManager.add(SignalConst.EVENT_MINE_NOTICE, handler(this, this._onEventMineNotice));
        this._signalUpdateTitleInfo = G_SignalManager.add(SignalConst.EVENT_UPDATE_TITLE_INFO, handler(this, this._onEventTitleChange));

        this._signalGetAllMoveCar = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_GET_ALL_MOVE_CAR, handler(this, this._onEventGetAllGrainCar));
        this._signalGrainCarMoveNotify = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_MOVE_NOTIFY, handler(this, this._onEventMoveCarNotify));
        this._signalGo2Mine = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_GO2MINE, handler(this, this._onEventGo2Mine));
        this._signalChangeMine2Car = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_CAR_INTO_MINE, handler(this, this._onEventChangeMine2Car));
        this._signalUpdateArmy = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_UPDATE_ARMY, handler(this, this._onEventUpdateArmy));
        this._signalGrainCarNotify = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_NOTIFY, handler(this, this._onEventGrainCarNotify));

        this._topBar.setImageTitle('txt_sys_com_mine');
        this._topBar.updateUI(TopBarStyleConst.STYLE_MINE_CRAFT);

        this._scheduleHandler = function () {
            this._update(0.03);
        }.bind(this)
        this.schedule(this._scheduleHandler, 0.03)
        this._refreshView();
        this._refreshAvatar();

        if (this._focusedMineId) {
            this._focusOnMine(this._focusedMineId);
        } else {
            this._refreshViewPos(true);
        }
        if (this._bOpenGrainCarDonate) {
            G_SceneManager.showDialog( Path.getPrefab("PopupGrainCarDonate","grainCar"));
        }
        this._updateMyArmy();
        this._updateInfame();

        this._checkKillNotice();
        this._onEventRedPointUpdate();
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.addGetUserBaseInfoEvent();
        var time = G_ServerTime.getNextHourCount(12);
        this._textTime.string = (time);

        this._grainCarProc();

    }
    onExit(): void {
        this._signalGetMineWorld.remove();
        this._signalGetMineWorld = null;
        this._signalSettleMine.remove();
        this._signalSettleMine = null;
        this._signalMineRespond.remove();
        this._signalMineRespond = null;
        this._signalGetMineMoney.remove();
        this._signalGetMineMoney = null;
        this._signalBattleMine.remove();
        this._signalBattleMine = null;
        this._signalReConnect.remove();
        this._signalReConnect = null;
        this._signalFastBattle.remove();
        this._signalFastBattle = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalMineNotice.remove();
        this._signalMineNotice = null;
        this._signalUpdateTitleInfo.remove();
        this._signalUpdateTitleInfo = null;
        this._signalGetAllMoveCar.remove();
        this._signalGetAllMoveCar = null;
        this._signalGrainCarMoveNotify.remove();
        this._signalGrainCarMoveNotify = null;
        this._signalGo2Mine.remove();
        this._signalGo2Mine = null;
        this._signalChangeMine2Car.remove();
        this._signalChangeMine2Car = null;
        this._signalUpdateArmy.remove();
        this._signalUpdateArmy = null;
        this._signalGrainCarNotify.remove();
        this._signalGrainCarNotify = null;
        if (this._scheduleHandler != null) {
            this.unschedule(this._scheduleHandler)
            this._scheduleHandler = null;
        }
        this._stopGrainCarTimer();
        this._stopUpdateInfame();
        G_BulletScreenManager.clearBulletLayer();
    }

    _updatePrivilege() {
        //--------
        if (this._btnPrivilege.node.active) {
            if (G_UserData.getMineCraftData().isSelfPrivilege()) {
                this._updateMyArmy();
                this._btnPrivilege.showRedPoint(G_UserData.getMineCraftData().isPrivilegeRedPoint());
                var leftSec = G_ServerTime.getLeftSeconds(G_UserData.getMineCraftData().getPrivilegeTime());
                this._textPrivilegeTime.node.active = (leftSec > 0);
                this._textPrivilegeTime.string = (G_ServerTime.getLeftDHMSFormatEx(G_UserData.getMineCraftData().getPrivilegeTime()));
            }
            return;
        }
        var payCfg = MineCraftHelper.getPrivilegeVipCfg();
        var vipLimit = payCfg.vip_show;
        var vipLevel = G_UserData.getVip().getLevel() || 0;
        var bVisible = vipLimit <= vipLevel;
        this._btnPrivilege.node.active = (bVisible) && G_ConfigManager.checkCanRecharge();
    }
    _checkKillNotice() {
        var killType = G_UserData.getMineCraftData().getKillType();
        if (killType != 0) {
            var enemyDiePos = G_UserData.getMineCraftData().getTargetPos();
            var enemyMine = G_UserData.getMineCraftData().getMineConfigById(enemyDiePos);
            var enemyCity = '';
            if (enemyMine) {
                enemyCity = enemyMine.pit_name;
            }
            var myData = G_UserData.getMineCraftData().getMyMineData();
            var myCityName = myData.getConfigData().pit_name;
            if (killType == MineCraftView.DIE_TYPE_ENEMY) {
                MineCraftHelper.openAlertDlg(Lang.get('fight_enemy_kill_title'), Lang.get('mine_enemy_kill_content', { city: enemyCity }));
            } else if (killType == MineCraftView.DIE_TYPE_SELF) {
                MineCraftHelper.openAlertDlg(Lang.get('mine_self_kill_title'), Lang.get('mine_self_kill_content', { city: myCityName }));
            } else if (killType == MineCraftView.DIE_TYPE_DOUBLE) {
                MineCraftHelper.openAlertDlg(Lang.get('mine_All_kill_title'), Lang.get('mine_All_kill_content', {
                    city1: enemyCity,
                    city2: myCityName
                }));
            }
        }
        G_UserData.getMineCraftData().setKillType(0);
    }

    //创建地图背景
    _createMapBG() {
        var innerContainer = this._scrollMapBG.content;
        var pic1 = UIHelper.newSprite(Path.getStageBG('minebg3'));
        pic1.node.setContentSize(1402,784);
        pic1.sizeMode = cc.Sprite.SizeMode.RAW;
        pic1.node.setAnchorPoint(new cc.Vec2(0, 0));
        pic1.node.setPosition(new cc.Vec2(0, 0));
        innerContainer.addChild(pic1.node);
        var size = pic1.node.getContentSize();
        var pic2 = UIHelper.newSprite(Path.getStageBG('minebg4'));
        pic2.node.setContentSize(1402,784);
        pic2.sizeMode = cc.Sprite.SizeMode.RAW;
        pic2.node.setAnchorPoint(new cc.Vec2(0, 0));
        pic2.node.setPosition(new cc.Vec2(size.width, 0));
        innerContainer.addChild(pic2.node);
        size.width = size.width + pic2.node.getContentSize().width;
        var pic3 = UIHelper.newSprite(Path.getStageBG('minebg1'));
        pic3.node.setContentSize(1402,784);
        pic3.sizeMode = cc.Sprite.SizeMode.RAW;
        pic3.node.setAnchorPoint(new cc.Vec2(0, 0));
        pic3.node.setPosition(new cc.Vec2(0, size.height));
        innerContainer.addChild(pic3.node);
        size.height = size.height + pic3.node.getContentSize().height;
        var pic4 = UIHelper.newSprite(Path.getStageBG('minebg2'));
        pic4.node.setContentSize(1402,784);
        pic4.sizeMode = cc.Sprite.SizeMode.RAW;
        pic4.node.setAnchorPoint(new cc.Vec2(0, 0));
        pic4.node.setPosition(new cc.Vec2(pic3.node.getContentSize().width, pic1.node.getContentSize().height));
        innerContainer.addChild(pic4.node);

        this._grainCarRoute = cc.instantiate(this._GrainCarRoute).getComponent(GrainCarRoute);
        innerContainer.addChild(this._grainCarRoute.node);
        this._grainCarRoute.node.setPosition(cc.v2(0, 0));
        this._grainCarCorpse = new cc.Node();
        innerContainer.addChild(this._grainCarCorpse);
        this._grainCarCorpse.setPosition(cc.v2(0, 0));

        this._mineBaseNode = new cc.Node();
        innerContainer.addChild(this._mineBaseNode);
        this._mineBaseNode.setPosition(new cc.Vec2(0, 0));
        this._mapSize = size;
        var scaleSize = cc.size(size.width * MineCraftView.SCALE_PERCENT, size.height * MineCraftView.SCALE_PERCENT);
        this._scrollMapBG.content.setContentSize(scaleSize);
        innerContainer.setPosition(new cc.Vec2(0, 0));
        innerContainer.setScale(MineCraftView.SCALE_PERCENT);
    }
    _createMineNode() {
        var mineDataList = G_UserData.getMineCraftData().getMines();
        for (var j in mineDataList) {
            var v = mineDataList[j];
            var mineNode = ((cc.instantiate(this._mineNodePrefab) as cc.Node).getComponent(MineNode)) as MineNode;
            mineNode.setInitData(v)
            this._mineBaseNode.addChild(mineNode.node);
            this._mines[v.getId()] = mineNode;
            mineNode.updateUI();
        }

        this._mineGetMoneyIcon = (cc.instantiate(this._mineGetMoneyIconPrefab) as cc.Node).getComponent(MineGetMoneyIcon);
        this._mineBaseNode.addChild(this._mineGetMoneyIcon.node);
        this._mineGetMoneyIcon.node.active = (false);
    }
    _createAvatar() {
        this._heroAvatar = cc.instantiate(this._heroAvatarPrefab).getComponent(CommonHeroAvatar);
        this._heroAvatar.init();
        this._mineBaseNode.addChild(this._heroAvatar.node);
        this._heroAvatar.setTouchEnabled(false);
        var avatarId = G_UserData.getBase().getAvatar_base_id();
        var config = G_ConfigLoader.getConfig(ConfigNameConst.AVATAR).get(avatarId);
      //assert((config, 'wront avatar id , avatarId');
        var limit = config.limit == 1 && 3;
        this._heroAvatar.updateUI(G_UserData.getBase().getPlayerBaseId(), null, null, limit);
        this._heroAvatar.setScale(MineCraftView.SCALE_AVATAR);
        this._showMineTitle();
    }
    _showMineTitle() {
        var titleItem = PopupHonorTitleHelper.getEquipedTitle();
        var titleId = titleItem && titleItem.getId() || 0;
        this._heroAvatar.showTitle(titleId, this.node.name);
    }
    _onEventTitleChange() {
        this._showMineTitle();
    }
    _onEventGetMineWorld(eventName, message) {
        if (!this._ismoving) {
            this._refreshView();
        }
    }
    _onEventSettleMine() {
        this._roads = G_UserData.getMineCraftData().getRoads();
        this._movebyPath();
        var startMineId = this._roads[0];
        var targetMineId = this._roads[this._roads.length-1];
        this._refreshCarPosInMineWithMineId(startMineId);
        this._refreshCarPosInMineWithMineId(targetMineId);
    }
    _movebyPath() {
        this._heroAvatar.setAction('run', true);
        this._ismoving = true;
        this._moveIndex = 1;
        //等待确认01
        this._setSingleRoadConfig(this._roads[0], this._roads[this._moveIndex]);
    }
    _setSingleRoadConfig(minPit1, minPit2) {
        var midPoints = G_UserData.getMineCraftData().getMidPoints();
        var midPoint = midPoints[minPit1 +""+ minPit2];
        if (!midPoint) {
            midPoint = midPoints[minPit2 +""+ minPit1];
        }
      //assert((midPoint, 'not midPoint between ' + (minPit1 + ('and' + minPit2)));
        var startData = G_UserData.getMineCraftData().getMineDataById(minPit1).getConfigData();
        var startPos = new cc.Vec2(startData.x, startData.y);
        var endData = G_UserData.getMineCraftData().getMineDataById(minPit2).getConfigData();
        var endPos = new cc.Vec2(endData.x, endData.y);
        this._heroAvatar.node.setPosition(startPos);
        this._bezier = [
            new cc.Vec2(0, 0),
            new cc.Vec2(midPoint.x - startPos.x, midPoint.y - startPos.y),
            new cc.Vec2(endPos.x - startPos.x, endPos.y - startPos.y)
        ];

        this._maxdistance = startPos.sub(endPos).mag();
        this._distance = 0;
        this._positionDelta = new cc.Vec2(endPos.x - startPos.x, endPos.y - startPos.y);
        this._startPos = startPos;
        if (endPos.x < startPos.x) {
            this._heroAvatar.turnBack();
        } else {
            this._heroAvatar.turnBack(false);
        }
    }
    _actorMoving(f) {
        this._distance = this._distance + MineCraftView.ACTOR_SPEED;
        var t = this._distance / this._maxdistance;
        t = t > 1 && 1 || t;
        var [posx, posy, angle] = MineCraftHelper.getBezierPosition(this._bezier, t);

        var pos = this._startPos.add(new cc.Vec2(posx, posy));;
        this._heroAvatar.node.setPosition(pos);
        this._refreshViewPos();
        if (t == 1) {
            if (this._moveIndex == this._roads.length-1) {
                this._ismoving = false;
                this._refreshView();
                this._refreshAvatar();
                this._popupSelfMine();
            } else {
                this._moveIndex = this._moveIndex + 1;
                this._setSingleRoadConfig(this._roads[this._moveIndex-1], this._roads[this._moveIndex]);
                
            }
        }
    }
    _update(f) {
        if (this._ismoving) {
            this._actorMoving(f);
        }
        this._lastUpdate = this._lastUpdate + f;
        if (this._lastUpdate > 1) {
            this._updateMyMoney();
            this._lastUpdate = 0;
        }
        var curTime = G_ServerTime.getTime();
        if (curTime - this._lastDoubleActionTime >= 10) {
            this._doDoubleIconsAnim();
            this._lastDoubleActionTime = curTime;
        }
        var time = G_ServerTime.getNextHourCount(12);
        this._textTime.string = (time);
        this._updatePrivilege();

        var [bExist, mine] = G_UserData.getMineCraftData().isExistPeaceMine();
        if (bExist) {
            this._textPeaceMine.string = (Lang.get('mine_peace_keep_time'));
            this._textTimePeace.string = (G_ServerTime.getLeftSecondsString(mine.getEndTime()));
        } else {
            this._textPeaceMine.string = (Lang.get('mine_peace_refresh_time'));
            var nextFreshTime = MineCraftHelper.getNextPeaceStartTime();
            this._textTimePeace.string = (G_ServerTime.getLeftSecondsString(nextFreshTime));
        }
        this._updateCarPos(f);

    }
    _doDoubleIconsAnim() {
        for (var i in this._mines) {
            var v = this._mines[i];
            v.doDoubleAnim();
        }
    }
    _refreshAvatar() {
        var selfMine = G_UserData.getMineCraftData().getMyMineData();
        var config = selfMine.getConfigData();
        var position = new cc.Vec2(config.x - MineCraftView.AVATAR_POS_FIX.x, config.y + MineCraftView.AVATAR_POS_FIX.y);
        this._heroAvatar.node.setPosition(position);
        this._heroAvatar.setAction('idle', true);
    }
    //刷新位置
    _refreshViewPos(isMinePos?, needSlow?) {
        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width / 2;
        var height = size.height / 2;
        var avatarX, avatarY;
        if (isMinePos) {
            var selfMine = G_UserData.getMineCraftData().getMyMineData();
            var config = selfMine.getConfigData();
            avatarX = config.x;
            avatarY = config.y;
        } else {
            var pos = this._heroAvatar.node.getPosition();
            avatarX = pos.x;
            avatarY = pos.y;
        }
        var mapY = 0;
        if (avatarY < height) {
            mapY = 0;
        } else if (avatarY + height > this._mapSize.height) {
            mapY = -this._mapSize.height + height * 2;
        } else {
            mapY = -avatarY + height;
        }
        var mapX = 0;
        if (avatarX < width) {
            mapX = 0;
        } else if (avatarX + width > this._mapSize.width) {
            mapX = -this._mapSize.width + width * 2;
        } else {
            mapX = -avatarX + width;
        }
        var xxx = -mapX / (this._mapSize.width - width * 2) * 100;
        var yyy = (-mapY) / (this._mapSize.height - height * 2) * 100;
        if (!needSlow) {
            this._scrollMapBG.scrollTo(new cc.Vec2(xxx/100, yyy/100));
        } else {
            this._scrollMapBG.scrollTo(new cc.Vec2(xxx/100, yyy/100), MineCraftView.SCROLL_TIME, true);
        }
    }
    _onEventMineRespond(eventName) {
        if (!this._ismoving) {
            this._refreshView();
        }
    }
    _refreshView() {
        this._refreshMyMoney();
        this._updateMyMoney();
        this._updateMoneyIconPos();
        var mineDataList = G_UserData.getMineCraftData().getMines();
        for (let i in mineDataList) {
            var v = mineDataList[i];
            var mineNode = this._mines[v.getId()];
            mineNode.refreshData(v);
            mineNode.updateUI();
        }
        if (this._lastMineId != G_UserData.getMineCraftData().getSelfMineId()) {
            this._refreshAvatar();
            this._refreshViewPos(true);
            this._lastMineId = G_UserData.getMineCraftData().getSelfMineId();
        }
        this._updateMyArmy();
        this._updateInfame();
    }
    _refreshMyMoney() {
        this._outputMoney = MineCraftHelper.getSelfOutputSec();
    }
    _updateMyMoney() {
        var [moneyCount, moneyText, timePercent] = MineCraftHelper.getMoneyDetail(this._outputMoney);
        this._mineGetMoneyIcon.node.active = (moneyCount >= 1);
        this._mineGetMoneyIcon.updateUI(moneyText);
        this._mineGetMoneyIcon.updateTimer(timePercent);
    }
    _updateMoneyIconPos() {
        var selfMineData = G_UserData.getMineCraftData().getMyMineData();
        var config = selfMineData.getConfigData();
        this._mineGetMoneyIcon.node.setPosition(new cc.Vec2(config.x, config.y + MineCraftView.GET_ICON_Y_FIX));
    }
    _onEventGetMineMoney(eventName, award) {
        G_Prompt.showAwards(award);
        this._mineGetMoneyIcon.node.active = (false);
    }
    _updateMyArmy() {
        var nowArmy = G_UserData.getMineCraftData().getMyArmyValue();
        var maxArmy = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.TROOP_MAX).content);
        if (G_UserData.getMineCraftData().isSelfPrivilege()) {
            var soilderAdd = MineCraftHelper.getParameterContent(ParameterIDConst.MINE_CRAFT_SOILDERADD);
            maxArmy = maxArmy + soilderAdd;
        }
        this._textSeflArmy.string = (nowArmy + (' / ' + maxArmy));
        this._barArmy.node.active = (false);
        this._barArmyY.node.active = (false);
        this._barArmyR.node.active = (false);
        var percent = nowArmy / maxArmy * 100;
        var armyBar = this._barArmy;
        if (percent < 25) {
            armyBar = this._barArmyR;
        } else if (percent < 75) {
            armyBar = this._barArmyY;
        }
        armyBar.progress = (nowArmy / maxArmy);
        armyBar.node.active = (true);
        this._nodeLessArmyInfo.active = (false);
        var myConfig = G_UserData.getMineCraftData().getMyMineConfig();
        if (myConfig.pit_type == MineCraftHelper.TYPE_MAIN_CITY && nowArmy < MineCraftHelper.ARMY_TO_LEAVE) {
            this._nodeLessArmyInfo.active = (true);
        }
    }
    
    private _curInfameValue;
    private _scheduleInfameHandler;

    _updateInfame() {
        var infameValue = G_UserData.getMineCraftData().getSelfInfamValue();
        this._curInfameValue = infameValue;
        this._updateInfameLabel();
        if (this._curInfameValue > 0) {
            this._stopUpdateInfame();
            this._scheduleInfameHandler = handler(this, this._updateInfameTimer);
            this.schedule(this._scheduleInfameHandler, 1);
            this._updateInfameTimer();
        }
    }
    _updateInfameLabel() {
        this._nodeInfame.active = (this._curInfameValue > 0);
        this._labelInfam.string = (this._curInfameValue);
    }
    _updateInfameTimer() {
        var curTime = G_ServerTime.getTime();
        var infameValue = G_UserData.getMineCraftData().getSelfInfamValue();
        var bIsVip = G_ServerTime.getLeftSeconds(G_UserData.getMineCraftData().getPrivilegeTime()) > 0;
        var [REFRESH_TIME, NUM_PERCHANGE] = MineCraftHelper.getInfameCfg(bIsVip);
        var lastFreshTime = G_UserData.getMineCraftData().getSelfRefreshTime();
        var countChange = Math.floor((curTime - lastFreshTime) / REFRESH_TIME);
        this._curInfameValue = infameValue - NUM_PERCHANGE * countChange;
        this._updateInfameLabel();
    }
    _stopUpdateInfame() {
        if (this._scheduleInfameHandler != null) {
            this.unschedule(this._scheduleInfameHandler);
            this._scheduleInfameHandler = null;
        }
    }

    _popupSelfMine() {
        var selfMineData = G_UserData.getMineCraftData().getMyMineData();
        var popupMine = G_SceneManager.getRunningScene().getPopupByName('PopupMine');
        var popupGrainCar = G_SceneManager.getRunningScene().getPopupByName('PopupGrainCar');
        if (popupMine) {
            popupMine.getComponent(PopupMine).close();
        }
        if (popupGrainCar) {
            popupGrainCar.getComponent(PopupGrainCar).close();
        }

        if (GrainCarDataHelper.haveCarInMineId(selfMineData.getId())) {
            G_SceneManager.openPopup(Path.getPrefab("PopupGrainCar","grainCar"),function(pop:PopupGrainCar){
                pop.ctor(selfMineData);
                pop.openWithAction();
            }.bind(this),selfMineData.getId(),selfMineData);
        } else {
            G_SceneManager.openPopup(Path.getPrefab("PopupMine","mineCraft"),function(pop:PopupMine){
                pop.setInitData(selfMineData);
                pop.openWithAction();
            }.bind(this),selfMineData.getId());
        }


    }
    //收到战斗消息
    _onEventBattleMine(eventName, message, target) {
        var config = G_UserData.getMineCraftData().getMyMineData().getConfigData();
        var fightBG = config.battle_bg;
        var mineFightData = {
            star: message.self_star,
            myBeginArmy: message.self_begin_army,
            myEndArmy: message.self_begin_army - message.self_red_army,
            tarBeginArmy: message.tar_begin_army,
            tarEndArmy: message.tar_begin_army - message.tar_red_army,
            myBeginInfame: message.self_begin_infamy,
            myEndInfame: message.self_begin_infamy + message.self_infamy_add,
            tarBeginInfame: message.tar_begin_infamy,
            tarEndInfame: message.tar_begin_infamy - message.tar_infamy_desc
        };
        if (mineFightData.tarEndArmy <= 0 && mineFightData.myEndArmy <= 0) {
            G_UserData.getMineCraftData().setKillType(MineCraftView.DIE_TYPE_DOUBLE);
        } else if (mineFightData.tarEndArmy <= 0) {
            G_UserData.getMineCraftData().setKillType(MineCraftView.DIE_TYPE_ENEMY);
        } else if (mineFightData.myEndArmy <= 0) {
            G_UserData.getMineCraftData().setKillType(MineCraftView.DIE_TYPE_SELF);
        }
        var enterFightView = function (message, target, fightBG, mineFightData) {
            var battleReport = G_UserData.getFightReport().getReport();
            var reportData = ReportParser.parse(battleReport);
            var battleData = BattleDataHelper.parseMineBattle(target, fightBG, mineFightData);
            G_SceneManager.showScene('fight', reportData, battleData);
        }
        G_SignalManager.addOnce(SignalConst.EVENT_ENTER_FIGHT_SCENE, function () {
            enterFightView(message, target, fightBG, mineFightData);
        });
        G_UserData.getFightReport().c2sGetNormalBattleReport(message.battle_report);

    }
    _onReportClick() {
        G_SceneManager.showDialog('prefab/mineCraft/PopupReport', null, null);
        // G_MineNoticeService.testSmall();
    }
    private onMineClick() {
        this._refreshViewPos(true, true);
    }
    private onAddArmyClick() {
        var myConfig = G_UserData.getMineCraftData().getMyMineConfig();
        if (myConfig.pit_type != MineCraftHelper.TYPE_MAIN_CITY) {
            G_Prompt.showTip(Lang.get('mine_cannot_buy'));
        } else if (MineCraftHelper.getNeedArmy() <= 0) {
            G_Prompt.showTip(Lang.get('mine_buy_army_full'));
        } else {
            G_SceneManager.openPopup(Path.getPrefab("PopupBuyArmy","mineCraft"),function(pop:PopupBuyArmy){
                pop.openWithAction();
            })
        }
    }
    _onPrivilege() {
        G_SceneManager.openPopup(Path.getPrefab("PopupMineCraftPrivilege","mineCraft"));
        // G_MineNoticeService.testBig();
    }
    _onEventFinishLogin() {
        G_UserData.getMineCraftData().clearAllMineUser();
        G_UserData.getMineCraftData().c2sGetMineWorld();
    }
    //开启扫荡
    _onEventFastBattle(eventName, reportList) {
        var isDie = false;
        for(var j in reportList)
        {
            if(reportList[j]["self_is_die_"])
            {
                isDie = true;
                break;
            }
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupMineSweep","mineCraft"),function(pop:PopupMineSweep){
             pop.setInitData(reportList);
             pop.openWithAction();
        }.bind(this));
    }
    _onEventRedPointUpdate() {
        var [newReport, count] = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_MINE_CRAFT, 'reportRP');
        this._imageRP.node.active = (newReport);
        this._textRPCount.string = (count);
    }
    _onEventMineNotice(eventName, user, oldMineId, newMineId) {
        var avatar = this._getMoveAvatar();
        if (!avatar) {
            return;
        }
        var offLevel = parseInt(user.officer_level);
        var name = user.name;
        var avatarId = user.avatar_base_id;
        var baseId = user.leader;
        var limit = null;
        if (avatarId != 0) {
            var configData = AvatarDataHelper.getAvatarConfig(avatarId);
            baseId = configData.hero_id;
            var isRed = configData.limit;
            if (isRed == 1) {
                limit = 3;
            }
        }
        var titleId = user.title || 0;
        avatar.updateUI(baseId, name, offLevel, limit, titleId);
        avatar.node.active = (true);
        var mineData = G_UserData.getMineCraftData().getMineDataById(oldMineId);
        var config = mineData.getConfigData();
        var position = new cc.Vec2(config.x, config.y + MineCraftView.AVATAR_POS_FIX.y);
        avatar.node.setPosition(position);
        var path = MineCraftHelper.getRoad2(oldMineId, newMineId);
        //等待调试01
        path = table.insertValueByPos(path,0, oldMineId);
        this._moveByPath(avatar, path);
    }
    _moveByPath(avatar:MineMoveAvatar, path) {
        avatar.setAction('run', true);
        var actions = [];
        for (var i = 1; i < path.length; i++) {
            var minPit1 = path[i - 1];
            var minPit2 = path[i];
            var midPoints = G_UserData.getMineCraftData().getMidPoints();
            var midPoint = midPoints[minPit1 +""+ minPit2];
            if (!midPoint) {
                midPoint = midPoints[minPit2 +""+ minPit1];
            }
            var startData = G_UserData.getMineCraftData().getMineDataById(minPit1).getConfigData();
            var startPos = new cc.Vec2(startData.x, startData.y + MineCraftView.AVATAR_POS_FIX.y);
            var endData = G_UserData.getMineCraftData().getMineDataById(minPit2).getConfigData();
            var endPos = new cc.Vec2(endData.x, endData.y + MineCraftView.AVATAR_POS_FIX.y);
            var actionFunc = cc.callFunc(function () {
                if (endPos.x < startPos.x) {
                    avatar.turnBack();
                } else {
                    avatar.turnBack(false);
                }
            });
            var actionBezier = cc.bezierTo(1.5, [
                midPoint,
                endPos,
                endPos
            ]);
            var action = cc.spawn(actionBezier, actionFunc);
            actions.push(action);
        }
        var callBack = cc.callFunc(function () {
            avatar.node.active = (false);
        });
        actions.push(callBack);
        var actionP = cc.sequence(actions);
        avatar.node.runAction(actionP);
    }
    _getMoveAvatar() {
        for (var i in this._moveAvatars) {
            var v = this._moveAvatars[i];
            if (!v.node.active) {
                return v;
            }
        }
        if (this._moveAvatars.length >= MineCraftView.MOVE_AVATAR_MAX) {
            return null;
        }
        return this._createMoveAvatar();
    }
    _createMoveAvatar() {
        var heroAvatar = (cc.instantiate(this._moveAvatarPrefab) as cc.Node).getComponent(MineMoveAvatar);
        heroAvatar.node.active = (false);
        this._mineBaseNode.addChild(heroAvatar.node);
        this._moveAvatars.push(heroAvatar);
        return heroAvatar;
    }

    _getMoveCar(guildId) {
        var carInfo = this._moveCarsHashTable['k' + guildId];
        if (carInfo) {
            return carInfo;
        }
        if (this._moveCarsHashTable.length >= MineCraftView.MOVE_AVATAR_MAX) {
            return null;
        }
        return this._createMoveCarInfo(guildId);
    }
    _createMoveCarInfo(guildId) {
        console.log('MineCraftView:_createMoveCarInfo   guildId = ' + guildId);
        var carAvatar = cc.instantiate(this._MineMoveCar).getComponent(MineMoveCar);
        this._mineBaseNode.addChild(carAvatar.node);
        carAvatar.node.active = (false);
        var carInfo = {
            car: carAvatar,
            status: GrainCarConst.CAR_STATUS_UNKNOW
        };
        this._moveCarsHashTable['k' + guildId] = carInfo;
        return carInfo;
    }
    _reuseMoveCar(guildId) {
        var carInfo = this._moveCarsHashTable['k' + guildId];
        if (carInfo) {
            carInfo.car.node.removeFromParent();
            this._moveCarsHashTable['k' + guildId] = null;
        }
    }
    _createCarCorpse() {
        var corpseHashTable = G_UserData.getGrainCar().getGrainCarCorpseHashTable();
        for (let mineId in corpseHashTable) {
            var levels = corpseHashTable[mineId];
            for (let level in levels) {
                var carUnitList = levels[level];
                var mineData = G_UserData.getMineCraftData().getMineDataById(mineId);
                var config = mineData.getConfigData();
                var carCorpse = cc.instantiate(this._MineMoveCarCorpse).getComponent(MineMoveCarCorpse);
                carCorpse.onLoad();
                carCorpse.updateUIWithLevel(level);
                var posFix = MineCraftView.CORPSE_FIX[level];
                var position = cc.v2(config.x + posFix.x, config.y + posFix.y);
                this._grainCarCorpse.addChild(carCorpse.node);
                carCorpse.node.setPosition(position);
                this._addCorpseAvatar(mineId, level, carCorpse);
                for (let i in carUnitList) {
                    var carUnit = carUnitList[i];
                    carCorpse.addName(carUnit);
                }
            }
        }
    }
    _addCarCorpse(carUnit) {
        var mineId = carUnit.getCurPit();
        var level = carUnit.getLevel();
        var corpseHashTable = G_UserData.getGrainCar().getGrainCarCorpseHashTable();
        if (corpseHashTable[mineId] && corpseHashTable[mineId][level]) {
            var carList = corpseHashTable[mineId][level];
            if (carList.length >= GrainCarConst.MAX_CORPSE_EACH_LEVEL) {
                return;
            }
        }
        let carCorpse = this._getCorpseAvatar(mineId, level);
        if (carCorpse) {
            carCorpse.addName(carUnit);
        } else {
            var mineData = G_UserData.getMineCraftData().getMineDataById(mineId);
            var config = mineData.getConfigData();
            let carCorpse = cc.instantiate(this._MineMoveCarCorpse).getComponent(MineMoveCarCorpse);
            carCorpse.updateUIWithLevel(level);
            var posFix = MineCraftView.CORPSE_FIX[level];
            var position = cc.v2(config.x + posFix.x, config.y + posFix.y);
            this._grainCarCorpse.addChild(carCorpse.node);
            carCorpse.node.setPosition(position);
            this._addCorpseAvatar(mineId, level, carCorpse);
            carCorpse.addName(carUnit);
        }
    }
    _addCorpseAvatar(mineId, level, carCorpse) {
        if (!this._corpseAvatar[mineId]) {
            this._corpseAvatar[mineId] = {};
        }
        this._corpseAvatar[mineId][level] = carCorpse;
    }
    _getCorpseAvatar(mineId, level) {
        if (this._corpseAvatar[mineId] && this._corpseAvatar[mineId][level]) {
            return this._corpseAvatar[mineId][level];
        }
        return null;
    }
    _updateGrainCarPos(carAvatar:MineMoveCar, minPit1, minPit2, percent) {
        var midPoints = G_UserData.getMineCraftData().getMidPoints();
        var midPoint:cc.Vec2 = midPoints[minPit1 +""+ minPit2];
        if (!midPoint) {
            midPoint = midPoints[minPit2 +""+ minPit1];
        }
        assert(midPoint, 'not midPoint between ' + (minPit1 + ('and' + minPit2)));
        var startData = G_UserData.getMineCraftData().getMineDataById(minPit1).getConfigData();
        var startPos = cc.v2(startData.x, startData.y);
        var endData = G_UserData.getMineCraftData().getMineDataById(minPit2).getConfigData();
        var endPos = cc.v2(endData.x, endData.y);
        carAvatar.node.setPosition(startPos);
        var bezier = [
            cc.v2(0, 0),
            midPoint.sub(startPos),
            endPos.sub(startPos)
        ];
        var [posx, posy, angle] = MineCraftHelper.getBezierPosition(bezier, percent);
        var pos = startPos.add(cc.v2(posx, posy));
        carAvatar.node.setPosition(pos);
        if (endPos.x < startPos.x) {
            carAvatar.turnBack();
        } else {
            carAvatar.turnBack(false);
        }
    }
    _grainCarProc() {
        if (GrainCarDataHelper.canShowCarCorpse()) {
            this._createCarCorpse();
        }
        this._startGrainCarTimer();
        G_BulletScreenManager.setBulletScreenOpen(BullectScreenConst.GRAIN_CAR_TYPE, true);
        if (!GrainCarConfigHelper.isTodayOpen()) {
            return;
        }
        if (GrainCarConfigHelper.isInActivityTime() && !G_UserData.getGrainCar().isActivityOver()) {
            G_AudioManager.playMusicWithId(AudioConst.SOUND_GRAIN_CAR_BGM);
            this._curBgm = AudioConst.SOUND_GRAIN_CAR_BGM;
        }
        this._updateGrainCarCountDown();
        this._updateGrainCarBtn();
    }
    _onEventGetAllGrainCar(eventName, grainCarList) {
        for (let i in grainCarList) {
            var carUnitData = grainCarList[i];
            var carInfo = this._getMoveCar(carUnitData.getGuild_id());
            if (carInfo) {
                var carAvatar = carInfo.car;
                carAvatar.updateUI(carUnitData);
                carAvatar.node.active = (true);
                if (carUnitData.isReachTerminal() || carUnitData.isDead()) {
                    this._reuseMoveCar(carUnitData.getGuild_id());
                } else {
                    var [pit1, pit2, percent] = carUnitData.getCurCarPos();
                    this._updateGrainCarPos(carAvatar, pit1, pit2, percent);
                    this._grainCarRoute.createRoute(carUnitData);
                }
                this._refreshCarPosInMine(carUnitData, false);
            }
        }
    }
    _refreshCarPosInMine(carUnit, bForceRefresh) {
        var [pit1, pit2, percent] = carUnit.getCurCarPos();
        if (bForceRefresh || carUnit.isStop()) {
            this._refreshCarPosInMineWithMineId(pit1);
        }
    }
    _refreshCarPosInMineWithMineId(mineId) {
        var offsetX = 0;
        var selfMine = G_UserData.getMineCraftData().getMyMineData();
        if (selfMine.getId() == mineId) {
            offsetX = 90;
        }
        var mineData = G_UserData.getMineCraftData().getMineDataById(mineId);
        var config = mineData.getConfigData();
        var carListSameMine = GrainCarDataHelper.getGuildCarInMineId(mineId);
        var posFix = MineCraftView.CAR_AVATAR_POS_FIX;
        if (mineId == MineCraftView.MINE_ID_UP_MAX) {
            posFix = MineCraftView.CAR_AVATAR_POS_FIX_110;
        } else if (mineId == MineCraftView.MINE_ID_LEFT_MAX) {
            posFix = MineCraftView.CAR_AVATAR_POS_FIX_210;
        }
        for (var i = 0; i < carListSameMine.length; i++) {
            var carUnit = carListSameMine[i];
            var position = cc.v2(config.x - posFix.x - offsetX, config.y + posFix.y);
            var carInfo = this._getMoveCar(carUnit.getGuild_id());
            if (carInfo) {
                var carAvatar = carInfo.car;
                carAvatar.node.setPosition(position);
                carAvatar.setGuildNameYWithIndex(i);
            }
        }
    }
    _updateGrainCarBtn() {
        if (G_UserData.getGuild().getMyGuildId() == 0 || G_UserData.getGrainCar().isEmergencyClose() || G_UserData.getGrainCar().isActivityOver()) {
            this._btnGrainCar.node.active = (false);
            return;
        }
        this._btnGrainCar.node.active = (GrainCarConfigHelper.isInActivityTimeFromGenerate());
        var isShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_GRAIN_CAR, 'mainRP');
        this._btnGrainCar.showRedPoint(isShow);
    }
    private _logTime;

    _updateCarPos(f) {
        if (!GrainCarConfigHelper.isTodayOpen() || !GrainCarConfigHelper.isInActivityTime()) {
            return;
        }
        this._logTime = G_ServerTime.getMSTime();
        this._frameGrainCar = this._frameGrainCar + f;
        if (this._frameGrainCar > 2 * f) {
            this._frameGrainCar = 0;
        }
        var curFrame = this._frameGrainCar / f;
        var grainCarList = G_UserData.getGrainCar().getGrainCarList();
        if(!grainCarList)
        {
            return;
        }
        var carCount = grainCarList.length;
        for (let i in grainCarList) {
            var carUnitData = grainCarList[i];
            if (carCount > 15) {
                if (parseInt(i) % 3 == curFrame) {
                    this._updateCarUnit(carUnitData);
                }
            } else {
                this._updateCarUnit(carUnitData);
            }
        }
    }
    _updateCarUnit(carUnitData) {
        if (carUnitData.isReachTerminal() || carUnitData.isDead()) {
            this._reuseMoveCar(carUnitData.getGuild_id());
        } else {
            var carInfo = this._getMoveCar(carUnitData.getGuild_id());
            if (carInfo) {
                var carAvatar = carInfo.car;
                carAvatar.node.active = (true);
                var [pit1, pit2, percent] = carUnitData.getCurCarPos();
                if (percent > 0 && percent < 1) {
                    if (carInfo.status != GrainCarConst.CAR_STATUS_RUN) {
                        carAvatar.updateUI(carUnitData);
                        carInfo.status = GrainCarConst.CAR_STATUS_RUN;
                        carAvatar.playRun();
                        carAvatar.resetGuildNamePos();
                        this._refreshCarPosInMineWithMineId(pit1);
                    }
                    this._grainCarRoute.updateArrow(carUnitData, percent);
                } else {
                    if (carInfo.status != GrainCarConst.CAR_STATUS_IDLE) {
                        carInfo.status = GrainCarConst.CAR_STATUS_IDLE;
                        carAvatar.updateUI(carUnitData);
                        carAvatar.playIdle();
                    }
                }
                if (carInfo.status == GrainCarConst.CAR_STATUS_RUN) {
                    this._updateGrainCarPos(carAvatar, pit1, pit2, percent);
                }
            }
        }
    }
    _focusOnMine(mineId) {
        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width / 2;
        var height = size.height / 2;
        var mineData = G_UserData.getMineCraftData().getMineDataById(mineId);
        if (!mineData) {
            return;
        }
        var config = mineData.getConfigData();
        var avatarX = config.x;
        var avatarY = config.y;
        var mapY = 0;
        if (avatarY < height) {
            mapY = 0;
        } else if (avatarY + height > this._mapSize.height) {
            mapY = -this._mapSize.height + height * 2;
        } else {
            mapY = -avatarY + height;
        }
        var mapX = 0;
        if (avatarX < width) {
            mapX = 0;
        } else if (avatarX + width > this._mapSize.width) {
            mapX = -this._mapSize.width + width * 2;
        } else {
            mapX = -avatarX + width;
        }
        var xxx = -mapX / (this._mapSize.width - width * 2) * 100;
        var yyy = 100 - -mapY / (this._mapSize.height - height * 2) * 100;
        this._scrollMapBG.scrollTo(cc.v2(xxx, yyy))
    }
    _startGrainCarTimer() {
        if (!this._scheduleGrainCarHandler) {
            this._scheduleGrainCarHandler = handler(this, this._grainCarTimer)
            this.schedule(this._scheduleGrainCarHandler, 1);
            this._grainCarTimer();
        }
    }
    _stopGrainCarTimer() {
        if (this._scheduleGrainCarHandler != null) {
           this.unschedule(this._scheduleGrainCarHandler);
            this._scheduleGrainCarHandler = null;
        }
    }
    _setCountDownType(type) {
        this._textRichMine.node.active = (type == 0);
        this._textTime.node.active = (type == 0);
        this._textPeaceMine.node.active = (type == 0);
        this._textTimePeace.node.active = (type == 0);
        this._textGrainCar.node.active = (type != 0);
        this._textTimeGrainCar.node.active = (type != 0);
        this._textGrainCar.node.x = (MineCraftView.GRANCAR_COUNTDOWN_TITLE_POSX_NORMAL);
        this._textTimeGrainCar.node.x = (MineCraftView.GRANCAR_COUNTDOWN_LABEL_POSX_NORMAL);
    }
    _updateGrainCarCountDown() {
        if (!GrainCarConfigHelper.isTodayOpen()) {
            this._setCountDownType(0);
            return;
        }
        var endTime:Date = GrainCarConfigHelper.getGrainCarEndTimeStamp();
        if (GrainCarConfigHelper.isInActivityTime()) {
            if (GrainCarConfigHelper.isInLaunchTime()) {
                this._setCountDownType(1);
                this._textTimeGrainCar.string = (G_ServerTime.getLeftSecondsString(endTime.getTime()/1000));
            } else {
                if (G_UserData.getGrainCar().isActivityOver()) {
                    this._setCountDownType(0);
                } else {
                    this._setCountDownType(1);
                    this._textTimeGrainCar.string = (Lang.get('grain_car_minecraft_wait_over'));
                    this._textTimeGrainCar.node.x = (MineCraftView.GRANCAR_COUNTDOWN_LABEL_POSX_AFTER2230);
                    this._textGrainCar.node.active = (false);
                }
            }
        } else {
            this._setCountDownType(0);
        }
    }
    _onGrainCarClick() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_GRAIN_CAR);
    }
    _onEventMoveCarNotify(eventName, newCarUnit) {
        this._grainCarRoute.createRoute(newCarUnit);
        this._refreshCarPosInMine(newCarUnit, true);
        this._grainCarRoute.removePassed(newCarUnit);
    }
    _onEventGo2Mine(eventName, mineId) {
        this._focusOnMine(mineId);
    }
    _onEventChangeMine2Car(eventName, mineData) {
        G_SceneManager.openPopup(Path.getPrefab("PopupGrainCar","grainCar"),function(pop:PopupGrainCar){
            pop.ctor(mineData);
            pop.openWithAction();
        }.bind(this),mineData.getId(), mineData);
    }
    _onEventUpdateArmy(eventName) {
        this._updateMyArmy();
    }
    _onEventGrainCarNotify(eventName, carUnit) {
        if (carUnit) {
            var carInfo = this._moveCarsHashTable['k' + carUnit.getGuild_id()];
            if (carInfo) {
                var carAvatar = carInfo.car;
                carAvatar.updateUI(carUnit);
            }
        }
        if (carUnit && carUnit.getStamina() == 0) {
            this._refreshCarPosInMine(carUnit, true);
            this._grainCarRoute.removeRoute(carUnit);
            this._addCarCorpse(carUnit);
        }
    }
    _grainCarTimer() {
        if (GrainCarConfigHelper.isTodayOpen() && GrainCarConfigHelper.isInActivityTime() && !G_UserData.getGrainCar().isActivityOver()) {
            if (this._curBgm != AudioConst.SOUND_GRAIN_CAR_BGM) {
                G_AudioManager.playMusicWithId(AudioConst.SOUND_GRAIN_CAR_BGM);
                this._curBgm = AudioConst.SOUND_GRAIN_CAR_BGM;
            }
        } else {
            if (this._curBgm != AudioConst.MUSIC_BGM_NEW_CITY) {
                G_AudioManager.playMusicWithId(AudioConst.MUSIC_BGM_NEW_CITY);
                this._curBgm = AudioConst.MUSIC_BGM_NEW_CITY;
            }
        }
        this._updateGrainCarCountDown();
        this._updateGrainCarBtn();
        this._grainCarCorpse.active = (GrainCarDataHelper.canShowCarCorpse());
    }



}