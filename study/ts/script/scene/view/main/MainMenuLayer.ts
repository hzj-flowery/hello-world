const { ccclass, property } = cc._decorator;
import { config } from '../../../config';
import { CakeActivityConst } from '../../../const/CakeActivityConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { GrainCarConst } from '../../../const/GrainCarConst';
import { G_ParameterIDConst } from '../../../const/ParameterIDConst';
import { RedPacketRainConst } from '../../../const/RedPacketRainConst';
import { RunningManConst } from '../../../const/RunningManConst';
import { SignalConst } from '../../../const/SignalConst';
import { SingleRaceConst } from '../../../const/SingleRaceConst';
import { TenJadeAuctionConst } from '../../../const/TenJadeAuctionConst';
import UIGuideConst from '../../../const/UIGuideConst';
import { UniverseRaceConst } from '../../../const/UniverseRaceConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { Colors, G_ConfigLoader, G_ConfigManager, G_GameAgent, G_NativeAgent, G_ResolutionManager, G_SceneManager, G_ServerTime, G_ServiceManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonNextFunctionOpen from '../../../ui/component/CommonNextFunctionOpen';
import CommonVipMidNode from '../../../ui/component/CommonVipMidNode';
import CustomNumLabel from '../../../ui/number/CustomNumLabel';
import { CakeActivityDataHelper } from '../../../utils/data/CakeActivityDataHelper';
import { Day7RechargeDataHelper } from '../../../utils/data/Day7RechargeDataHelper';
import { SingleRaceDataHelper } from '../../../utils/data/SingleRaceDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { VipDataHelper } from '../../../utils/data/VipDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../utils/handler';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Path } from '../../../utils/Path';
import Queue from '../../../utils/Queue';
import { TextHelper } from '../../../utils/TextHelper';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import { CampRaceHelper } from '../campRace/CampRaceHelper';
import { CrossWorldBossHelperT } from '../crossWorldBoss/CrossWorldBossHelperT';
import GrainCarConfigHelper from '../grainCar/GrainCarConfigHelper';
import { GuildAnswerHelper } from '../guildAnswer/GuildAnswerHelper';
import { GuildCrossWarHelper } from '../guildCrossWar/GuildCrossWarHelper';
import { GuildServerAnswerHelper } from '../guildServerAnswer/GuildServerAnswerHelper';
import HomelandBuffIcon from '../homeland/HomelandBuffIcon';
import PopupPlayerDetail from '../playerDetail/PopupPlayerDetail';
import { QinTombHelper } from '../qinTomb/QinTombHelper';
import { RunningManHelp } from '../runningMan/RunningManHelp';
import { SeasonSportHelper } from '../seasonSport/SeasonSportHelper';
import { ShopHelper } from '../shop/ShopHelper';
import { TenJadeAuctionConfigHelper } from '../tenJadeAuction/TenJadeAuctionConfigHelper';
import UIGuideRootNode from '../uiguide/UIGuideRootNode';

@ccclass
export default class MainMenuLayer extends ViewBase {

    @property({ type: CommonHeroIcon, visible: true })
    _commonHeroIcon: CommonHeroIcon = null;

    @property({ type: cc.Node, visible: true })
    _panelDesign: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelInfo: cc.Node = null;

    @property({ type: cc.ProgressBar, visible: true })
    _playerExpBar: cc.ProgressBar = null;

    @property({ type: cc.Label, visible: true })
    _playerExp: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageAvatarBg: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imagePlayerBg: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imagePlayer: cc.Sprite = null;


    @property({ type: cc.Sprite, visible: true })
    _imgBtnBgIPX: cc.Sprite = null;


    @property({ type: cc.Sprite, visible: true })
    _imgBtnBgNormal: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _panelBag: cc.Sprite = null;



    @property({ type: cc.Sprite, visible: true })
    _imageAvatarCover: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _playerLevel: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _playerName: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _playerPower: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodePower: cc.Node = null;

    @property({ type: CommonVipMidNode, visible: true })
    _playerVip: CommonVipMidNode = null;

    @property({ type: cc.Button, visible: true })
    _btnMainFight: cc.Button = null;

    @property({ type: cc.Sprite, visible: true })
    _imageBottomShade: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeBtn: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _chatNode: cc.Node = null;

    @property({ type: CommonMainMenu, visible: true })
    _btnStronger: CommonMainMenu = null;

    @property({ type: CommonMainMenu, visible: true })
    _btnShop: CommonMainMenu = null;

    @property({ type: CommonMainMenu, visible: true })
    _btnMore: CommonMainMenu = null;

    @property({ type: CommonMainMenu, visible: true })
    _btnIndulge: CommonMainMenu = null;

    @property({ type: CommonMainMenu, visible: true })
    _btnGroup: CommonMainMenu = null;

    @property({ type: CommonMainMenu, visible: true })
    _btnAdventure: CommonMainMenu = null;

    @property({ type: CommonNextFunctionOpen, visible: true })
    _nextFunctionOpen: CommonNextFunctionOpen = null;

    @property({ type: HomelandBuffIcon, visible: true })
    _btnBuff: HomelandBuffIcon = null;



    private _morePanel: cc.Node;
    private _heroAvatar1;
    private _redDotMap: { [key: string]: { id: number, node: cc.Button, imgRed: cc.Node }[] };
    private _menusMapData: { [key: string]: { cfg, functionId: number, funcSubId: number, customData, node: CommonMainMenu } };
    private _btnMap: { [key: string]: { btn: CommonMainMenu, menuData: any } };
    private _viewMapData: { [key: number]: cc.Node };
    private _label: CustomNumLabel;

    private _uiGuideRootNode: UIGuideRootNode;

    private _signalUserDataUpdate;
    private _signalUserLevelUpdate;
    private _signalRedPointUpdate;
    private _signalMainCityCheckBtns;
    private _signalActivityNotice;
    private _signalVipExpChange;
    private _signalSendMineInfo;
    private _signalRecvRecoverInfo;
    private _signalShopNewRemindUpdate;
    private _signalRedPacketRainStartNotify;
    private _signalLoginSuccess;
    private _funcId2HeroReach;

    private _right_top_a1: any[];
    private _more_icons: any[];
    private _homelandBuff: HomelandBuffIcon;
    _activeFuncId: any;
    _funcList: { funcId: number; }[][];


    private copyArray(src: Array<any>) {
        var target = [];
        for (var j = 0; j < src.length; j++)
            target.push(src[j]);
        return target;
    }

    onCreate() {
        this._cacheReset = new Queue();
        this.setSceneSize();
        this._heroAvatar1 = null;
        this._menusMapData = {};
        this._redDotMap = {};
        this._btnMap = {};
        this._viewMapData = {};

        var panelMore: cc.Node = this._panelDesign.getChildByName('Panel_more');
        this._morePanel = panelMore;
        this._morePanel.setScale(0);
        this._morePanel.active = false;
        this._panelDesign.on(cc.Node.EventType.TOUCH_START, handler(this, this._onPanelConTouch));
        (this._panelDesign as any)._touchListener.setSwallowTouches(false);
        this._setRedDotData(this._btnMainFight.node.getChildByName('RedPoint'), FunctionConst.FUNC_NEW_STAGE, this._btnMainFight);
        this._btnMainFight.node.zIndex = 10000;
        this._setOtherBtnCallback();

        this._panelInfo.on(cc.Node.EventType.TOUCH_END, handler(this, this._onClickPanelInfo));

        this._initFuncMap();
        this._createUIGuideRoot();

        this._homelandBuff = this._btnBuff;
        this._more_icons = MainMenuLayer.MORE_ICON;
        this.handleWXServices();

        this._initBagMergePanel();

        this.onEnter1();
    }
    private handleWXServices(): void {
        this._right_top_a1 = this.copyArray(MainMenuLayer.RIGHT_TOP_ICON_A1);
        let deleteIndex: number = -1;
        this._right_top_a1.forEach((element, index) => {
            if (element.funcId == FunctionConst.FUNC_WX_SERVICE) {
                deleteIndex = index;
            }
        });
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            deleteIndex >= 0 ? this._right_top_a1.splice(deleteIndex, 1) : 0;
        } else {
            //开服七天后 加qq群的功能加入到moreIcons中去
            if (G_UserData.getBase().getOpenServerDayNum() > 15) {
                deleteIndex >= 0 ? this._right_top_a1.splice(deleteIndex, 1) : 0;
                this._more_icons.pop();
            }
        }
    }

    private _createUIGuideRoot() {
        if (!this._uiGuideRootNode) {
            this._uiGuideRootNode = new cc.Node().addComponent(UIGuideRootNode);
            this.node.addChild(this._uiGuideRootNode.node);
        }
        this._uiGuideRootNode.bindUIGuide(UIGuideConst.GUIDE_TYPE_MAIN_CITY_FIGHT, 0, this._btnMainFight.node);
        var uiguildNode = this._btnMainFight.node.getChildByName("UIGuideNode");
        if (uiguildNode)
            uiguildNode.y = 70;
    }

    onBagMergeBtn() {
        var isOpenMore = !this._panelBag.node.active;
        this._openBagMerge(isOpenMore);
    }
    _openBagMerge(boolValue: boolean) {
        var isOpenMore = this._panelBag.node.active;
        if (isOpenMore == boolValue) {
            return;
        }
        this._panelBag.node.stopAllActions();
        if (boolValue == true) {
            this._panelBag.node.active = (true);
            var actionOpen = cc.scaleTo(0.3, 1).easing(cc.easeBackOut());
            var finishFunc = cc.callFunc(function () {
            });
            this._panelBag.node.runAction(cc.sequence(actionOpen, finishFunc));
        } else {
            var actionClose = cc.scaleTo(0.2, 0).easing(cc.easeExponentialOut());
            var seqClose = cc.sequence(actionClose, cc.callFunc(function (node) {
                node.active = (false);
            }));
            this._panelBag.node.runAction(seqClose);
        }
    }

    private _initBagMergePanel() {
        this._panelBag.node.setScale(0);
        this._panelBag.node.active = (false);
    }
    private _resetBagMergeBtns() {
        if (!UserDataHelper.isEnoughBagMergeLevel()) {
            return;
        }
        var panelW = 400;
        var cols = 4;
        var spaceY = 86;
        var spaceX = 88;
        var offsetX = (panelW - spaceX * cols) / 2 - panelW / 2;
        var offsetY = 0;
        var menuList = this._createMenuList(MainMenuLayer.BAG_MERGE, this._panelBag.node);
        var conH = Math.ceil(menuList.length / cols) * spaceY + 20;
        for (let i = 1; i <= menuList.length; i++) {
            var value = menuList[i - 1];
            var btn: cc.Node = value.node.node;
            if (btn) {
                btn.scale = (0.9);
                btn.x = (offsetX + spaceX / 2 + spaceX * ((i - 1) % cols));
                btn.y = (conH - spaceY / 2 - offsetY - Math.floor((i - 1) / cols) * spaceY);
            }
        }
        this._panelBag.node.x = (this._bagMergePosX);
        this._panelBag.node.setContentSize(panelW, conH);
    }

    private updateAll() {
        this._updateRoleInfo();
        this._resetButtons();
        // this._resetRedIcon();
        this._nextFunctionOpen.updateUI();
    }
    _getEffectSMovingCanPlay(funcId) {
        if (funcId == FunctionConst.FUNC_WORLD_BOSS || funcId == FunctionConst.FUNC_GUILD_ANSWER || funcId == FunctionConst.FUNC_GUILD_DUNGEON || funcId == FunctionConst.FUNC_RUNNING_MAN || funcId == FunctionConst.FUNC_GUILD_WAR) {
            let [curFuncId, minStartTime, minEndTime, isNeedShowEffect] = G_UserData.getLimitTimeActivity().getCurMainMenuLayerActivityIcon();
            if (curFuncId == funcId && isNeedShowEffect) {
                return true;
            } else {
                return false;
            }
        }
        return true;
    }

    private _playBtnEffect() {
        for (const key in this._menusMapData) {
            var value = this._menusMapData[key];
            if (value && value.node) {
                var funcInfo = value.cfg;
                if (this._getEffectSMovingCanPlay(funcInfo.function_id)) {
                    value.node.playBtnMoving();
                }
            }
        }
    }




    private _scheduleResetHandler;
    private _cacheReset: Queue;
    private _delayResetNum: number;
    private _funcResetMap;
    _delayResetButtons(param?) {
        this._cacheReset.push(param);
        this._delayResetNum = this._delayResetNum || 0;
        this._delayResetNum = this._delayResetNum + 1;
        if (this._cacheReset.size() == 1) {
            if (this._scheduleResetHandler) {
                this.unschedule(this._scheduleResetHandler);
                this._scheduleResetHandler = null;
            }
            this._scheduleResetHandler = handler(this, this._resetButtons);
            this.scheduleOnce(this._scheduleResetHandler, 0.5);
        }
    }
    _resetButtons() {
        this._delayResetNum = 0;
        var size = this._cacheReset.size();
        var resetAll = false;
        var record = {};
        for (var i = 0; i < size; i++) {
            var t = this._cacheReset.pop();
            if (t == null) {
                resetAll = true;
                break;
            }
            record[t] = true;
        }
        if (size == 0) {
            resetAll = true;
        }
        if (resetAll) {
            for (let key in this._menusMapData) {
                var value = this._menusMapData[key];
                if (value && value.node) {
                    value.node.node.active = (false);
                }
            }
            this._resetLeftBottom();
            this._resetRightTop1();
            this._resetRightTop2();
            this._resetRightBottom2();
            this._resetRightBottom3();
            this._resetMoreBtns();
            this._resetOtherBtn();
            this._resetTerritory();
            this._resetFuncView();
            this._updateHeadFrameRedPoint();
            let procSpLogic = function () {
                var needShow = G_UserData.getAuction().isGuildAuctionShow() || G_UserData.getAuction().isCrossWorldBossAuctionShow();
                this.showEffectByFuncId(FunctionConst.FUNC_AUCTION, needShow);
            }.bind(this);
            procSpLogic();
        } else {
            for (let param in record) {
                var _ = record[param];
                var item = this._funcResetMap[param];
                if (item != null) {
                    var index = item[0];
                    var funcName: Function = item[1];
                    for (let key in this._menusMapData) {
                        var value = this._menusMapData[key];
                        //console.log(value.functionId);
                        if (value && value.node && value.isShow && value.functionId && this._funcResetMap[value.functionId] && this._funcResetMap[value.functionId][0] == index) {
                            value.node.node.active = (false);
                        }
                    }
                    funcName.apply(this);
                    if (index == 6) {
                        let procSpLogic = function () {
                            var needShow = G_UserData.getAuction().isGuildAuctionShow() || G_UserData.getAuction().isCrossWorldBossAuctionShow();
                            this.showEffectByFuncId(FunctionConst.FUNC_AUCTION, needShow);
                        }.bind(this);
                    }
                    //return;
                }
            }
            this._resetFuncView();
            this._updateHeadFrameRedPoint();
        }
        this._resetRedIcon();
    }


    private showEffectByFuncId(funcId, needShow) {
        var menuData = this._menusMapData['k' + funcId];
        if (menuData) {
            var node = menuData.node;
            node.stopFuncGfx();
            if (needShow == true) {
                node.playFuncGfx();
            }
        }
    }

    private _resetRedIcon() {
        for (const funcId in this._redDotMap) {
            var v = this._redDotMap[funcId];
            this._updateRedPointByFuncId(funcId);
        }
    }

    /**
     * 获取可见的一些活动倒计时时间
     * @param targetFuncId 
     * @param labelStr 
     */
    _getVisibleAndCountDownCallback(targetFuncId, labelStr) {
        if (this._activeFuncId != targetFuncId) {
            return [false, null];
        }
        var callBack = function (menuBtn, menuData) {
            var curTime = G_ServerTime.getTime();
            var [_, startTime, endTime, isNeedShowEffect] = G_UserData.getLimitTimeActivity().getCurMainMenuLayerActivityIcon();
            if (curTime < startTime) {
                menuBtn.removeCustomLabel();
                menuBtn.showRunningImage(false);
                menuBtn.openCountDown(startTime, function (menuBtnImp) {
                    menuBtnImp.showRunningImage(true);
                });
            } else {
                menuBtn.showRunningImage(true);
            }
            if (isNeedShowEffect) {
                menuBtn.playBtnMoving();
                menuBtn.playFuncGfx();
            } else {
                menuBtn.stopBtnMoving();
                menuBtn.stopFuncGfx();
            }
        };
        return [
            true,
            callBack
        ];
    }




    _getVisibleAndCountDownCallbackForQinTomb(labelStr) {
        var openingTable = QinTombHelper.getOpeningTable();
        if (openingTable.show == false) {
            return [false, null];
        }
        var callBack = function (menuBtn, menuData) {
            var curTime = G_ServerTime.getTime();
            menuBtn.removeCustomLabel();
            menuBtn.showRunningImage(false);
            if (openingTable.countDown) {
                menuBtn.openCountDown(openingTable.countDown, function (menuBtnImp) {
                    menuBtnImp.showRunningImage(true);
                });
                G_ServiceManager.registerOneAlarmClock('QinTombMainBtn', openingTable.refreshTime, function () {
                    G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GROUPS);
                });
            }
            if (openingTable.labelStr) {
                menuBtn.addCustomLabel(openingTable.labelStr, MainMenuLayer.TIP_FONT_SIZE, MainMenuLayer.TIP_POSITION, MainMenuLayer.TIP_COLOR, MainMenuLayer.TIP_OUTLINE_COLOR, 1);
                G_ServiceManager.registerOneAlarmClock('QinTombMainBtn', openingTable.refreshTime, function () {
                    G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GROUPS);
                });
            }
            if (openingTable.isFighting) {
                menuBtn.showRunningImage(true);
            }
            if (openingTable.isInTeam) {
                menuBtn.showInTeamImage(true);
            }
            if (openingTable.showEffect) {
                menuBtn.playBtnMoving();
                menuBtn.playFuncGfx();
            } else {
                menuBtn.stopBtnMoving();
                menuBtn.stopFuncGfx();
            }
        };
        return [
            true,
            callBack
        ];
    }
    _getVisibleAndCountDownCallbackForSeason(labelStr) {
        var date = SeasonSportHelper.getSeasonOpenTime();
        if (!SeasonSportHelper.isTodayOpen() || date.length <= 0) {
            return [false, null];
        }
        var callBack = function (menuBtn, menuData) {
            var curTime = G_ServerTime.getTime();
            var [isAcrossToday, startTime, endTime] = SeasonSportHelper.getActTimeRegion();
            var isNeedShowEffect = SeasonSportHelper.getRemainingTime() > 0 || false;
           // var [bWaiting, time] = SeasonSportHelper.getWaitingTime();
            menuBtn.showRunningImage(false);
            if (curTime < startTime) {
                var oneFirstTime = SeasonSportHelper.getFirstStartOpenTime();
                if (startTime - curTime > oneFirstTime * 3600 && isAcrossToday) {
                    var strTime = Lang.get('season_maintime_tomorrow', { time: oneFirstTime });
                    menuBtn.removeCustomLabel();
                    menuBtn.addCustomLabel(strTime, MainMenuLayer.TIP_FONT_SIZE, MainMenuLayer.TIP_POSITION, MainMenuLayer.TIP_COLOR, MainMenuLayer.TIP_OUTLINE_COLOR, 1);
                    G_ServiceManager.registerOneAlarmClock('SeasonMainBtn4', startTime - oneFirstTime * 3600, function () {
                        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SEASONSOPRT);
                    });
                } else if (startTime - curTime > 3600 * 2) {
                    var strTime = SeasonSportHelper.getMianWaitingTime() + Lang.get('season_maintime_start');
                    menuBtn.removeCustomLabel();
                    menuBtn.addCustomLabel(strTime, MainMenuLayer.TIP_FONT_SIZE, MainMenuLayer.TIP_POSITION, MainMenuLayer.TIP_COLOR, MainMenuLayer.TIP_OUTLINE_COLOR, 1);
                    G_ServiceManager.registerOneAlarmClock('SeasonMainBtn5', startTime - 3600 * 2, function () {
                        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SEASONSOPRT);
                    });
                } else {
                    menuBtn.removeCustomLabel();
                    menuBtn.openCountDown(startTime, function (menuBtnImp) {
                        menuBtnImp.showRunningImage(true);
                    });
                }
            } else {
                menuBtn.removeCustomLabel();
                menuBtn.showRunningImage(true);
            }
            if (curTime <= endTime) {
                G_ServiceManager.registerOneAlarmClock('SeasonMainBtn', endTime, function () {
                    G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SEASONSOPRT);
                });
            }
            if (isNeedShowEffect) {
                menuBtn.playBtnMoving();
                menuBtn.playFuncGfx();
            } else {
                menuBtn.stopBtnMoving();
                menuBtn.stopFuncGfx();
            }
        };
        return [
            true,
            callBack
        ];
    }

    _getVisibleAndCountDownCallbackForSingleRace(labelStr?) {
        var startTime = SingleRaceDataHelper.getStartTime();
        var endTime = SingleRaceDataHelper.getEndTime();
        if (startTime <= 0 || G_ServerTime.getTime() >= endTime) {
            return [false, null];
        }
        var callBack = function (menuBtn, menuData) {
            var curTime = G_ServerTime.getTime();
            var isNeedShowEffect = false;
            G_ServiceManager.registerOneAlarmClock('SingleRaceMainBtn', endTime, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SINGLE_RACE);
                G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_SINGLE_RACE);
            });
            var showEffectStartTime = startTime - 300;
            if (curTime < showEffectStartTime) {
                isNeedShowEffect = false;
                G_ServiceManager.registerOneAlarmClock('SingleRaceMainBtn', showEffectStartTime, function () {
                    G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SINGLE_RACE);
                });
            } else {
                isNeedShowEffect = true;
            }
            if (curTime < startTime) {
                menuBtn.removeCustomLabel();
                menuBtn.showRunningImage(false);
                menuBtn.openCountDown(startTime, function (menuBtnImp) {
                    menuBtnImp.showRunningImage(true);
                }, true);
            } else {
                menuBtn.showRunningImage(true);
            }
            if (isNeedShowEffect) {
                menuBtn.playBtnMoving();
                menuBtn.playFuncGfx();
            } else {
                menuBtn.stopBtnMoving();
                menuBtn.stopFuncGfx();
            }
        };
        return [
            true,
            callBack
        ];
    }

    _getVisibleAndCountDownCallbackForUniverseRace(labelStr) {
        return [false, null]
        var createTime = G_UserData.getUniverseRace().getCreate_time();
        var beginTime = G_UserData.getUniverseRace().getBegin_time();
        var endTime = UniverseRaceDataHelper.getEndTime();
        if (createTime <= 0 || G_ServerTime.getTime() >= endTime) {
            return [false, null];
        }
        if (G_ServerTime.getTime() < createTime) {
            G_ServiceManager.registerOneAlarmClock('UniverseRaceMainBtn1', createTime, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_UNIVERSE_RACE);
            });
            return [false, null];
        }
        var callBack = function (menuBtn, menuData) {
            var curTime = G_ServerTime.getTime();
            var isNeedShowEffect = false;
            G_ServiceManager.registerOneAlarmClock('UniverseRaceMainBtn', endTime, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_UNIVERSE_RACE);
                G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_UNIVERSE_RACE);
            });
            var showEffectStartTime = beginTime;
            if (curTime < showEffectStartTime) {
                isNeedShowEffect = false;
                G_ServiceManager.registerOneAlarmClock('UniverseRaceMainBtn2', showEffectStartTime, function () {
                    G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_UNIVERSE_RACE);
                });
            } else {
                isNeedShowEffect = true;
            }
            if (curTime < beginTime) {
                menuBtn.removeCustomLabel();
                menuBtn.showRunningImage(false);
                menuBtn.openCountDown(beginTime, function (menuBtnImp) {
                    menuBtnImp.showRunningImage(true);
                }, true);
            } else {
                menuBtn.showRunningImage(true);
            }
            if (isNeedShowEffect) {
                menuBtn.playBtnMoving();
                menuBtn.playFuncGfx();
            } else {
                menuBtn.stopBtnMoving();
                menuBtn.stopFuncGfx();
            }
        };
        return [
            true,
            callBack
        ];
    }


    private _getVisibleAndCountDownCallbackForRedPacketRain(labelStr?) {
        var actId = G_UserData.getRedPacketRain().getActId();
        var startTime = G_UserData.getRedPacketRain().getActOpenTime();
        var endTime = G_UserData.getRedPacketRain().getActEndTime();
        var curTime = G_ServerTime.getTime();
        var startShowTime = startTime - RedPacketRainConst.TIME_PRE_SHOW_ICON;
        if (G_UserData.getRedPacketRain().isPlayed()) {
            return [false, null];
        }
        if (actId == 0 || startTime == 0 || endTime == 0 || curTime < startShowTime || curTime >= endTime) {
            return [false, null];
        }
        var callBack = function (menuBtn, menuData) {
            var curTime = G_ServerTime.getTime();
            var isNeedShowEffect = false;
            G_ServiceManager.registerOneAlarmClock('RedPacketRainMainBtn', endTime, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_RED_PACKET_RAIN);
                G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_AUCTION);
            });
            var showEffectStartTime = startTime;
            if (curTime < showEffectStartTime) {
                isNeedShowEffect = false;
                G_ServiceManager.registerOneAlarmClock('RedPacketRainMainBtn2', showEffectStartTime, function () {
                    G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_RED_PACKET_RAIN);
                });
            } else {
                isNeedShowEffect = true;
            }
            if (isNeedShowEffect) {
                menuBtn.playBtnMoving();
                menuBtn.playFuncGfx();
            } else {
                menuBtn.stopBtnMoving();
                menuBtn.stopFuncGfx();
            }
        };
        return [
            true,
            callBack
        ];
    }

    private _getVisibleAndCountDownCallbackForGachaGoldenHero(labelStr?): any[] {
        var startTime = G_UserData.getGachaGoldenHero().getStart_time();
        var endTime = G_UserData.getGachaGoldenHero().getEnd_time();
        var showTime = G_UserData.getGachaGoldenHero().getShow_time();
        var curTime = G_ServerTime.getTime();
        if (startTime == 0 || endTime == 0 || curTime > showTime || curTime < startTime) {
            return [false, null];
        }
        var callBack = function (menuBtn, menuData) {
            menuBtn.removeCustomLabel();
            menuBtn.addCustomLabel(labelStr, 18, cc.v2(5, -30), Colors.WHITE, Colors.strokeBlack);
            menuBtn.playBtnMoving();
            menuBtn.playFuncGfx();
        };
        return [
            true,
            callBack
        ];
    }

    private _getVisibleAndCountDownCallbackForCakeActivity() {
        var [actStage, startTime, endTime] = CakeActivityDataHelper.getActStage();
        if (actStage == CakeActivityConst.ACT_STAGE_0) {
            if (startTime) {
                G_ServiceManager.registerOneAlarmClock('CakeActivityMainBtn', startTime, function () {
                    G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_CAKE_ACTIVITY);
                });
            }
            return [false, null];
        }
        var callBack = function (menuBtn, menuData) {
            var curTime = G_ServerTime.getTime();
            var isNeedShowEffect = false;
            G_ServiceManager.registerOneAlarmClock('CakeActivityMainBtn', endTime, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_CAKE_ACTIVITY);
            });
            var labelStr = Lang.get('lang_guild_answer_main_layer_running');
            if (actStage == CakeActivityConst.ACT_STAGE_1 || actStage == CakeActivityConst.ACT_STAGE_3) {
                isNeedShowEffect = true;
                menuBtn.showRunningImage(true);
            } else if (actStage == CakeActivityConst.ACT_STAGE_2) {
                isNeedShowEffect = false;
                menuBtn.removeCustomLabel();
                menuBtn.showRunningImage(false);
                menuBtn.openCountDown(endTime, function (menuBtnImp) {
                    menuBtnImp.showRunningImage(true);
                }, true);
            } else if (actStage == CakeActivityConst.ACT_STAGE_4) {
                isNeedShowEffect = false;
                labelStr = Lang.get('cake_activity_main_menu_finish');
                menuBtn.showFinishedImage(true);
            }
            if (isNeedShowEffect) {
                menuBtn.playBtnMoving();
                var info = CakeActivityDataHelper.getCurCakeResouceConfig();
                menuBtn.playFuncGfx(info);
            } else {
                menuBtn.stopBtnMoving();
                menuBtn.stopFuncGfx();
            }
        };

        return [
            true,
            callBack
        ];
    }

    //获取军团boss这个活动是否可见及自定义数据
    private _getWorldBossVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_WORLD_BOSS)[0];

        if (!isOpen) {
            return [false, null];
        }
        var customData: any = {};
        var bossID = G_UserData.getWorldBoss().getBoss_id();
        if (bossID && bossID != 0) {
            var iconPath = Path.getCommonIcon('main', 'btn_main_enter_worldboss' + bossID);
            customData.icon = iconPath;
        }
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallback(FunctionConst.FUNC_WORLD_BOSS, Lang.get('worldboss_main_layer_running'));
        if (isVisible) {
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }
    private _getCrossWorldBossVisibleAndCustomData() {
        var [isOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS);
        if (!isOpen) {
            return [false, null];
        }
        var customData: any = {};
        var bossID = G_UserData.getCrossWorldBoss().getBoss_id();
        var bossConfigInfo = CrossWorldBossHelperT.getBossConfigInfo(bossID);
        if (bossConfigInfo && bossConfigInfo.id != 0) {
            var iconPath = Path.getCommonIcon('main', 'btn_main_enter_crossboss' + bossConfigInfo.id);
            customData.icon = iconPath;
        }
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallback(FunctionConst.FUNC_CROSS_WORLD_BOSS, Lang.get('worldboss_main_layer_running'));
        customData.callFunc = callFunc;
        return [
            isVisible,
            customData
        ];

    }

    private _getGuildAnswerVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_ANSWER)[0];
        if (!isOpen) {
            return [false, null];
        }
        var isTodayOpen = GuildAnswerHelper.isTodayOpen();
        if (!isTodayOpen) {
            return [false, null];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallback(FunctionConst.FUNC_GUILD_ANSWER, Lang.get('lang_guild_answer_main_layer_running'));
        if (isVisible) {
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }

    private _getGuildServerAnswerVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_SERVER_ANSWER)[0];
        if (!isOpen) {
            return [false, null];
        }
        var isTodayOpen = GuildServerAnswerHelper.isTodayOpen();
        if (!isTodayOpen) {
            return [false, null];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallback(FunctionConst.FUNC_GUILD_SERVER_ANSWER, Lang.get('lang_guild_answer_main_layer_running'));
        if (isVisible) {
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }

    private _getRunningManVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RUNNING_MAN)[0];
        if (!isOpen) {
            return [false, null];
        }
        var customData: any = {};
        var visibleStr = Lang.get('lang_guild_answer_main_layer_running');
        var runningState = RunningManHelp.getRunningState();
        if (runningState == RunningManConst.RUNNING_STATE_BET || runningState == RunningManConst.RUNNING_STATE_PRE_START) {
            visibleStr = Lang.get('lang_guild_answer_main_layer_bet');
        }
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallback(FunctionConst.FUNC_RUNNING_MAN, visibleStr);
        if (isVisible) {
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }

    private _getGuildDungeonVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_DUNGEON)[0];
        if (!isOpen) {
            return [false, null];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallback(FunctionConst.FUNC_GUILD_DUNGEON, Lang.get('lang_guild_answer_main_layer_running'));
        if (isVisible) {
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }

    private _getCountryBossVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_COUNTRY_BOSS)[0];
        if (!isOpen) {
            return [false, null];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallback(FunctionConst.FUNC_COUNTRY_BOSS, Lang.get('lang_guild_answer_main_layer_running'));
        if (isVisible) {
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }

    private _getCampRaceVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CAMP_RACE)[0];
        if (!isOpen) {
            return [false, null];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallback(FunctionConst.FUNC_CAMP_RACE, Lang.get('lang_guild_answer_main_layer_running'));
        if (isVisible) {
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }

    private _getSingleRaceVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_SINGLE_RACE)[0];
        if (!isOpen) {
            return [false, null];
        }
        var status = G_UserData.getSingleRace().getStatus();
        if (status == SingleRaceConst.RACE_STATE_NONE || status == SingleRaceConst.RACE_STATE_FINISH) {
            return [false, null];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallbackForSingleRace(Lang.get('lang_guild_answer_main_layer_running'));
        if (isVisible) {
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }

    private _getRedPacketRainVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RED_PACKET_RAIN)[0];
        if (!isOpen) {
            return [false, null];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallbackForRedPacketRain('');
        if (isVisible) {
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }

    private _getGachaGoldenHeroVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GACHA_GOLDENHERO)[0];
        if (!isOpen) {
            return [false, null];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallbackForGachaGoldenHero();
        if (isVisible) {
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }

    private _getCakeActivityVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CAKE_ACTIVITY)[0];
        if (!isOpen) {
            return [false];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallbackForCakeActivity();
        if (isVisible) {
            customData.callFunc = callFunc;
            var info = CakeActivityDataHelper.getCurCakeResouceConfig();
            var iconPath = Path.getCommonIcon('main', info.icon);
            customData.icon = iconPath;
            customData.iconTxt = info.icon_word;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }
    private _getGrainCarVisibleAndCustomData() {
        var [isOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GRAIN_CAR);
        if (!isOpen) {
            return [false, null];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallbackForGrainCar();
        if (isVisible) {
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }
    private _getTenJadeAuctionVisibleAndCustomData() {
        var [isOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_TEN_JADE_AUCTION);
        if (!isOpen) {
            return [false, null];
        }
        if (!G_UserData.getTenJadeAuction().hasAuction()) {
            return [false, null];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallbackForTenJadeAuction();
        if (isVisible) {
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }
    private _getReturnActivityVisibleAndCustomData(): Array<any> {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RETURN)[0];
        if (!isOpen) {
            return [false, null];
        }
        var customData = {};
        var isVisible = G_UserData.getBase().isIs_regression() && G_UserData.getReturnData().getIsEmergency() == true;
        if (isVisible) {
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }
    private _getUniverseRaceVisibleAndCustomData() {
        var [isOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_UNIVERSE_RACE);
        if (!isOpen) {
            return [false, null];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallbackForUniverseRace(Lang.get('lang_guild_answer_main_layer_running'));
        if (isVisible) {
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }
    private _getUniverseRaceChampionViisible() {

        return [false, null];

        var [isOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_UNIVERSE_RACE_CHAMPION);
        if (!isOpen) {
            return [false, null];
        }
        var status = UniverseRaceDataHelper.getRaceStateAndTime();
        if (status == UniverseRaceConst.RACE_STATE_CHAMPION_SHOW) {
            return [true, null];
        } else {
            return [false, null];
        }
    }

    private _getVisibleAndCountDownCallbackForTenJadeAuction(labelStr?) {
        var phase = TenJadeAuctionConfigHelper.getAuctionPhase();
        if (phase == TenJadeAuctionConst.PHASE_END) {
            return [false, null];
        }
        if (phase == TenJadeAuctionConst.PHASE_DEFAULT) {
            G_ServiceManager.registerOneAlarmClock('TenJadeAuctionMainBtn', TenJadeAuctionConfigHelper.getAuctionOpenTimeStamp(), function () {
                G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_TEN_JADE_AUCTION);
            });
            return [false, null];
        }
        var callBack = function (menuBtn, menuData) {
            var curAuctionInfo = G_UserData.getTenJadeAuction().getCurAuctionInfo();
            if (phase == TenJadeAuctionConst.PHASE_SHOW) {
                menuBtn.removeCustomLabel();
                menuBtn.showRunningImage(false);
                menuBtn.stopBtnMoving();
                menuBtn.stopFuncGfx();
                menuBtn.openCountDown(curAuctionInfo.getStart_time(), function (menuBtnImp) {
                    menuBtnImp.showRunningImage(true);
                    menuBtn.playBtnMoving();
                    menuBtn.playFuncGfx(null, true);
                }, true);
            } else if (phase == TenJadeAuctionConst.PHASE_ITEM_SHOW || phase == TenJadeAuctionConst.PHASE_START) {
                menuBtn.showRunningImage(true);
                menuBtn.playBtnMoving();
                menuBtn.playFuncGfx(null, true);
                G_ServiceManager.registerOneAlarmClock('TenJadeAuctionMainBtn', curAuctionInfo.getEnd_time(), function () {
                    G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_TEN_JADE_AUCTION);
                });
            }
        };
        return [
            true,
            callBack
        ];
    }
    _getVisibleAndCountDownCallbackForGrainCar(labelStr?) {
        if (!GrainCarConfigHelper.isInActivityTimeFromGenerate()) {
            return [false, null];
        }
        if (G_UserData.getGuild().getMyGuildId() == 0) {
            return [false, null];
        }
        if (G_UserData.getGrainCar().isActivityOver()) {
            return [false, null];
        }
        if (G_UserData.getGrainCar().isEmergencyClose()) {
            return [false, null];
        }
        var actStage = GrainCarConfigHelper.getActStage();
        if (actStage == GrainCarConst.ACT_STATGE_GENERATED) {
            G_ServiceManager.registerOneAlarmClock('GrainCarMainBtn', GrainCarConfigHelper.getGrainCarEndTimeStamp(), function () {
                G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GRAIN_CAR);
            });
        }
        var callBack = function (menuBtn, menuData) {
            var actStage = GrainCarConfigHelper.getActStage();
            if (actStage == GrainCarConst.ACT_STATGE_GENERATED) {
                menuBtn.removeCustomLabel();
                menuBtn.showRunningImage(false);
                menuBtn.stopBtnMoving();
                menuBtn.stopFuncGfx();
                menuBtn.openCountDown(GrainCarConfigHelper.getGrainCarOpenTimeStamp() / 1000, function (menuBtnImp) {
                    menuBtnImp.showRunningImage(true);
                }, true);
            } else if (actStage == GrainCarConst.ACT_STATGE_OPEN) {
                menuBtn.showRunningImage(true);
                menuBtn.playBtnMoving();
                menuBtn.playFuncGfx();
            }
        }.bind(this);
        return [
            true,
            callBack
        ];
    }

    private _getSeasonSportVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_SEASONSOPRT)[0];
        var customData: any = {};
        if (!isOpen) {
            return [
                false,
                customData
            ];
        } else {
            var [isVisible, callFunc] = this._getVisibleAndCountDownCallbackForSeason(Lang.get('season_fighting'));
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }

    private _getQinTombVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GROUPS)[0];
        var customData: any = {};
        if (!isOpen) {
            return [
                false,
                customData
            ];
        } else {
            var [isVisible, callFunc] = this._getVisibleAndCountDownCallbackForQinTomb(Lang.get('qin_fighting'));
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }
    private _getRedPetVisibleAndCustomData() {
        var [isOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RED_PET);
        if (!isOpen) {
            return [false, null];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallbackForRedPet();
        if (isVisible) {
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }
    private _getVisibleAndCountDownCallbackForRedPet() {
        var isVisible = G_UserData.getRedPetData().isActivityOpen();
        var callBack = function (menuBtn, menuData) {
            menuBtn.removeCustomLabel();
            menuBtn.playBtnMoving();
            menuBtn.playFuncGfx();
        };
        return [
            isVisible,
            callBack
        ];
    }

    private _getHistoryHeroVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)[0];
        var customData: any = {};
        if (!isOpen) {
            return [
                false,
                customData
            ];
        } else {
            var [isVisible, callFunc] = this._getVisibleAndCountDownCallbackForSeason(Lang.get('season_fighting'));
            customData.callFunc = callFunc;
            return [
                true,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }

    private _getGuildWarVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_WAR)[0];
        if (!isOpen) {
            return [false, null];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallback(FunctionConst.FUNC_GUILD_WAR, Lang.get('lang_guild_answer_main_layer_running'));
        if (isVisible) {
            var bVisible = isVisible;
            if (GuildCrossWarHelper.isTodayOpen()[0]) {
                (bVisible as boolean) = !GuildCrossWarHelper.isGuildCrossWarEntry()[0];
            }
            customData.callFunc = callFunc;
            return [
                bVisible,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }

    private _getGuildCrossWarVisibleAndCustomData() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_CROSS_WAR)[0];
        if (!isOpen) {
            return [false, null];
        }
        var customData: any = {};
        var [isVisible, callFunc] = this._getVisibleAndCountDownCallback(FunctionConst.FUNC_GUILD_CROSS_WAR, Lang.get('lang_guild_answer_main_layer_running'));
        if (isVisible) {
            var bVisible = false;
            if (GuildCrossWarHelper.isTodayOpen()[0]) {
                bVisible = GuildCrossWarHelper.isGuildCrossWarEntry()[0];
            }
            customData.callFunc = callFunc;
            return [
                bVisible,
                customData
            ];
        }
        return [
            false,
            customData
        ];
    }

    private _getCampRaceChampionVisible() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_CAMP_RACE_CHAMPION)[0];
        if (!isOpen) {
            return false;
        }
        var champions = G_UserData.getCampRaceData().getChampion();
        var count = 0;
        for (let camp in champions) {
            var user = champions[camp];
            count = count + 1;
        }
        if (count == 0) {
            return false;
        }
        var visible = CampRaceHelper.isInCampChampionIconShowTime();
        return visible;
    }

    private _getRecharge2Visible() {
        var [isOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RECHARGE2);
        if (!isOpen) {
            return false;
        }
        return true;
    }

    private _getReturnConfirmVisible() {
        if (G_GameAgent.isLoginReturnServer()) {
            var returnSvr = G_UserData.getBase().getReturnSvr();
            if (returnSvr == null) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    private _getReturnAwardVisible() {
        if (G_GameAgent.isLoginReturnServer() == false) {
            return false;
        }
        var returnSvr = G_UserData.getBase().getReturnSvr();
        if (returnSvr) {
            if (returnSvr.isAllReceived()) {
                return false;
            } else {
                return true;
            }
        } else {
            var isCanReturn = G_GameAgent.isCanReturnServer();
            if (isCanReturn) {
                return true;
            } else {
                return false;
            }
        }
    }
    private _getTShirtVisible() {
        return false;
        // var [isOpen] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_TSHIRT);
        // if (!isOpen) {
        //     return false;
        // }
        // return G_UserData.getTShirt().isOpen();
    }

    private _getSingleRaceChampionVisible() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_SINGLE_RACE_CHAMPION)[0];
        if (!isOpen) {
            return false;
        }
        var status = G_UserData.getSingleRace().getStatus();
        if (status == SingleRaceConst.RACE_STATE_FINISH) {
            return true;
        } else {
            return false;
        }
    }

    private _getSvipVisible(functionId) {
        var isOpen = G_ConfigManager.isSvipOpen();
        if (isOpen && G_UserData.getBase().getVip_qq() > 0) {
            return true;
        } else {
            return false;
        }
    }

    private _getSvipVisible2(functionId) {
        var isOpen = G_ConfigManager.isSvipOpen2();
        if (isOpen) {
            return true;
        } else {
            return false;
        }
    }

    _getFunctionBtnVisibleAndCustomData(functionId) {
        var customData;
        var visible: boolean = true;
        if (functionId == FunctionConst.FUNC_FIRST_RECHARGE) {
            visible = G_UserData.getActivityFirstPay().needShowFirstPayAct();
        } else if (functionId == FunctionConst.FUNC_WEEK_ACTIVITY) {
            visible = G_UserData.getDay7Activity().isInActRewardTime();
        } else if (functionId == FunctionConst.FUNC_ACTIVITY) {
            visible = G_UserData.getTimeLimitActivity().hasTimeLimitActivityCanVisible();
        } else if (functionId == FunctionConst.FUNC_TASK_LIMIT) {
            visible = G_UserData.getTimeLimitActivity().hasTaskLimitCanVisible();
        }
        else if (functionId == FunctionConst.FUNC_GROWTH_FUND) {
            //成长基金
            visible = true;
        }
        else if (functionId == FunctionConst.FUNC_DAILY_GIFT_PACK) {
            //每日礼包
            visible = true;
        }
        else if (functionId == FunctionConst.FUNC_CARNIVAL_ACTIVITY) {
            var [isOpen] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_CARNIVAL_ACTIVITY);
            visible = G_UserData.getCarnivalActivity().hasActivityCanVisible();
            visible = visible && isOpen;
            customData = { iconShowFunctionId: G_UserData.getCarnivalActivity().getMainMenuIconFunctionId() };
        } else if (functionId == FunctionConst.FUNC_GACHA_GOLDENHERO) {
            [visible, customData] = this._getGachaGoldenHeroVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_MAIL) {
            visible = true;
        } else if (functionId == FunctionConst.FUNC_INDULGE) {
            visible = false;
        } else if (functionId == FunctionConst.FUNC_WORLD_BOSS) {
            [visible, customData] = this._getWorldBossVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_CROSS_WORLD_BOSS) {
            [visible, customData] = this._getCrossWorldBossVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_SEASONSOPRT) {
            [visible, customData] = this._getSeasonSportVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_GROUPS) {
            [visible, customData] = this._getQinTombVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_RED_PET) {
            [visible, customData] = this._getRedPetVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_HISTORY_HERO) {
            visible = true;
        } else if (functionId == FunctionConst.FUNC_GUILD_CROSS_WAR) {
            [visible, customData] = this._getGuildCrossWarVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_GUILD_ANSWER) {
            [visible, customData] = this._getGuildAnswerVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_GUILD_SERVER_ANSWER) {
            [visible, customData] = this._getGuildServerAnswerVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_GUILD_DUNGEON) {
            [visible, customData] = this._getGuildDungeonVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_GUILD_WAR) {
            [visible, customData] = this._getGuildWarVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_RUNNING_MAN) {
            //华容道
            [visible, customData] = this._getRunningManVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_PATROL_AWARDS) {
            visible = G_UserData.getTerritory().isHavePatrolAward();
        } else if (functionId == FunctionConst.FUNC_RIOT_AWARDS) {
            visible = G_UserData.getTerritory().isRiotHaveTake();
        } else if (functionId == FunctionConst.FUNC_RIOT_HAPPEN) {
            visible = G_UserData.getTerritory().isRiotHaveHelp();
        } else if (functionId == FunctionConst.FUNC_RIOT_HELP) {
            [visible] = G_UserData.getTerritory().isRiotHelpRedPoint();
            customData = {};
            customData.callFunc = function (menuBtn, menuData) {
                var [isShow, count] = G_UserData.getTerritory().isRiotHelpRedPoint();
                menuBtn.addCountText(count);
            };
        } else if (functionId == FunctionConst.FUNC_MAIN_STRONGER) {
            var notShowValue = parseInt(this.getParameter('recommend_upgrage_close'));
            if (G_UserData.getBase().getLevel() >= notShowValue) {
                visible = false;
            } else {
                visible = true;
            }
        } else if (functionId == FunctionConst.FUNC_TRAVEL) {
            customData = {};
            customData.callFunc = function (menuBtn, menuData) {
                var energyNum = G_UserData.getBase().getResValue(DataConst.RES_SPIRIT);
                var count = Math.floor(energyNum / 2);
                if (count >= 1) {
                    menuBtn.addCountText(count);
                    menuBtn.setCountTextVisible(true);
                } else {
                    menuBtn.setCountTextVisible(false);
                }
            };
        }
        else if (functionId == FunctionConst.FUNC_JUN_SHI_MIAO_JI) {
            visible = G_UserData.getMilitaryMasterPlan().getSuperLevelGiftData().length > 0;
        } else if (functionId == FunctionConst.FUNC_RECHARGE_REBATE) {
            visible = G_UserData.getRechargeRebate().isNotTakenRebate();
        } else if (functionId == FunctionConst.FUNC_MAIL_RED) {
            visible = RedPointHelper.isModuleReach(FunctionConst.FUNC_MAIL);
        } else if (functionId == FunctionConst.FUNC_ACTIVITY_RESOURCE_BACK) {
            visible = G_UserData.getActivityResourceBack().hasRedPoint();
        } else if (functionId == FunctionConst.FUNC_ENEMY_REVENGE_LOG) {
            visible = G_UserData.getRedPoint().isEnemyRevengeRedPoint();
        } else if (functionId == FunctionConst.FUNC_COUNTRY_BOSS) {
            [visible, customData] = this._getCountryBossVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_LINKAGE_ACTIVITY) {
            visible = G_UserData.getLinkageActivity().isVisible(1);
        } else if (functionId == FunctionConst.FUNC_LINKAGE_ACTIVITY2) {
            visible = G_UserData.getLinkageActivity().isVisible(2);
        } else if (functionId == FunctionConst.FUNC_VIP_GIFT) {
            visible = VipDataHelper.isShowEnterIcon();
        } else if (functionId == FunctionConst.FUNC_CAMP_RACE) {
            [visible, customData] = this._getCampRaceVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_CAMP_RACE_CHAMPION) {
            visible = this._getCampRaceChampionVisible();
        } else if (functionId == FunctionConst.FUNC_CHAPTER_BOSS) {
            visible = G_UserData.getChapter().isAliveBoss();
        } else if (functionId == FunctionConst.FUNC_AVOID_GAME) {
            visible = G_ConfigManager.isRealName() || G_ConfigManager.isAvoidHooked();
            if (G_GameAgent.isRealName()) {
                visible = false;
            }
        } else if (functionId == FunctionConst.FUNC_SUPER_VIP) {
            visible = this._getSvipVisible(functionId);
        } else if (functionId == FunctionConst.FUNC_SUPER_VIP_2) {
            visible = this._getSvipVisible2(functionId);
        } else if (functionId == FunctionConst.FUNC_RICH_MAN_INFO_COLLECT) {
            var minRechargeMoney = UserDataHelper.getParameter(G_ParameterIDConst.VIP_MIN_CHARGE);
            var isSvip = G_UserData.getBase().getRecharge_total() >= minRechargeMoney;
            visible = isSvip && !G_UserData.getBase().isIs_admit() && G_ConfigManager.isSvipRegisteOpen();
            console.warn('------------isSvip ' + (isSvip));
        } else if (functionId == FunctionConst.FUNC_SINGLE_RACE) {
            [visible, customData] = this._getSingleRaceVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_SINGLE_RACE_CHAMPION) {
            visible = this._getSingleRaceChampionVisible();
        } else if (functionId == FunctionConst.FUNC_OPPO_FORUM) {
            var opId = G_NativeAgent.getOpId() == 77;
            var opGameId = G_NativeAgent.getOpGameId() == 1001;
            visible = opId && opGameId && G_NativeAgent.hasForum();
        } else if (functionId == FunctionConst.FUNC_RED_PACKET_RAIN) {
            [visible, customData] = this._getRedPacketRainVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_CAKE_ACTIVITY) {
            [visible, customData] = this._getCakeActivityVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_GRAIN_CAR) {
            [visible, customData] = this._getGrainCarVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_TEN_JADE_AUCTION) {
            [visible, customData] = this._getTenJadeAuctionVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_RETURN) {
            [visible, customData] = this._getReturnActivityVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_UNIVERSE_RACE) {
            [visible, customData] = this._getUniverseRaceVisibleAndCustomData();
        } else if (functionId == FunctionConst.FUNC_UNIVERSE_RACE_CHAMPION) {
            [visible, customData] = this._getUniverseRaceChampionViisible();
        } else if (functionId == FunctionConst.FUNC_RECHARGE2) {
            visible = this._getRecharge2Visible(), customData = null;
        } else if (functionId == FunctionConst.FUNC_RETURN_CONFIRM) {
            visible = this._getReturnConfirmVisible();
        } else if (functionId == FunctionConst.FUNC_RETURN_AWARD) {
            visible = this._getReturnAwardVisible();
        } else if (functionId == FunctionConst.FUNC_TSHIRT) {
            visible = this._getTShirtVisible();
        } else if (functionId == FunctionConst.FUNC_SEVEN_DAY_RECHARGE) {
            visible = Day7RechargeDataHelper.isShow();
        } else if (functionId == FunctionConst.FUNC_SUPER_CHARGE_GIFT) {
            visible = G_UserData.getRechargeActivity().state != 1 && G_UserData.getBase().getOpenServerDayNum() <= 15;
        } else if (functionId == FunctionConst.FUNC_WX_SHARE) {
            visible = G_ServerTime.getTime() < G_UserData.getShareReward().getActivityEndTime() && !config.remoteCfg.hideWxShare;
        }
        return [
            visible,
            customData
        ];
    }



    private _createMenuData(funcData) {
        var funcId = funcData.funcId;
        var menuData: any = {};
        var funcInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(funcId);
        var visible, customData;
        if (funcInfo.forbidIos == 1 && !G_ConfigManager.checkCanRecharge()) {
            [visible, customData] = [false, null];
        }else {
            [visible, customData]= this._getFunctionBtnVisibleAndCustomData(funcId);
        }
        var isFuncShow = FunctionCheck.funcIsShow(funcId);
        visible = visible && isFuncShow;
        menuData.cfg = funcInfo;
        menuData.functionId = funcId;
        menuData.isShow = visible;
        menuData.funcData = funcData;
        menuData.funcSubId = funcData.funcSubId;
        menuData.customData = customData;
        return menuData;
    }

    private _createMenuList(funcList, rootPanel?, isShowFalseVisible?): any[] {
        let menuDataList = [];
        for (let i = 0; i < funcList.length; i++) {
            var value = funcList[i];
            let menuData = null;
            for (let k in value.replaceFuncIds || {}) {
                var item = (value.replaceFuncIds || {})[k];
                menuData = this._createMenuData(item);
                if (menuData.isShow == true) {
                    break;
                }
            }
            if (!menuData || !menuData.isShow) {
                menuData = this._createMenuData(value);
            }
            if (menuData.isShow == true) {
                var nodeData = this._createMenu(menuData, rootPanel);
                menuDataList.push(nodeData);
            } else {
                if (isShowFalseVisible) {
                    this._setIconMenuVisibleByMenuData(menuData, false);
                }
            }
        }

        //FUNC_CRYSTAL_SHOP 616
        //FUNC_DAILY_MISSION 8
        //FUNC_TASK_LIMIT 3001

        menuDataList.sort(function (item1, item2): number {
            if (item1.funcId == FunctionConst.FUNC_TASK_LIMIT && item2.funcId == FunctionConst.FUNC_CRYSTAL_SHOP)
                return 1;
            else if (item1.funcId == FunctionConst.FUNC_TASK_LIMIT && item2.funcId == FunctionConst.FUNC_DAILY_MISSION)
                return -1;
            return item1.cfg.home_index - item2.cfg.home_index;
        });
        return menuDataList;
    }


    private _setOtherBtnCallback() {
        var otherList = [];
        otherList.push(this._btnMore);
        otherList.push(this._btnShop);
        otherList.push(this._btnStronger);
        otherList.push(this._btnAdventure);
        otherList.push(this._btnGroup);
        otherList.push(this._btnIndulge);
        for (let i = 0; i < MainMenuLayer.OTHER_ICON.length; i++) {
            var node = otherList[i];
            if (node) {
                if (i == 0) {
                    node.addClickEventListenerEx(handler(this, this.onMoreBtn));
                } else {
                    node.addClickEventListenerEx(handler(this, this._onButtonClick));
                }
            }

        }
    }

    private _resetOtherBtn() {
        var otherList: CommonMainMenu[] = [];
        otherList.push(this._btnMore);
        otherList.push(this._btnShop);
        otherList.push(this._btnStronger);
        otherList.push(this._btnAdventure);
        otherList.push(this._btnGroup);
        otherList.push(this._btnIndulge);

        for (let i = 0; i < MainMenuLayer.OTHER_ICON.length; i++) {
            var value = MainMenuLayer.OTHER_ICON[i];
            var node: CommonMainMenu = otherList[i];
            var menuData = this._createMenuData(value);
            if (node) {
                if (menuData.isShow == true) {
                    node.node.active = true;
                    menuData.node = node;
                    var btn = node.getButton();
                    node.updateUI(menuData.functionId);
                    btn.name = ('commonMain' + menuData.functionId);
                    this._btnMap[btn.name] = { btn: node, menuData: menuData }
                    var funcId = menuData.functionId;
                    this._setRedDotData(node.getRedPoint(), funcId, btn);
                } else {
                    node.node.active = false;
                }
            }
            var customData = menuData.customData;
            if (customData) {
                if (customData.callFunc) {
                    customData.callFunc(node, menuData);
                }
            }
        }
    }

    private _resetFuncView() {
        this._viewMapData[FunctionConst.FUNC_CHAT] = this._chatNode;
        for (let i = 0; i < MainMenuLayer.FUNC_VIEW.length; i++) {
            var value = MainMenuLayer.FUNC_VIEW[i];
            var node = this._viewMapData[value.funcId];
            var menuData = this._createMenuData(value);
            if (!node && menuData.isShow) {
            }
            if (node) {
                node.active = (menuData.isShow);
            }
        }
    }

    private _bagMergePosX: number = 0;
    _resetLeftBottom() {
        // for (let i in MainMenuLayer.BAG_MERGE) {
        //     var value = MainMenuLayer.BAG_MERGE[i];
        //     var funcId = value.funcId;
        //     this._menusMapData['k' + funcId] = null;
        // }
        var menuList = [];
        if (UserDataHelper.isEnoughBagMergeLevel()) {
            menuList = this._createMenuList(MainMenuLayer.LEFT_BOTTOM_ICON_MERGE);
        } else {
            menuList = this._createMenuList(MainMenuLayer.LEFT_BOTTOM_ICON);
        }
        var iconInterval = MainMenuLayer.ICON_INTERVAL;
        for (let i = 0; i < menuList.length; i++) {
            let value = menuList[i];
            var node = value.node.node;
            if (node) {
                var posX = (i) * MainMenuLayer.ICON_SIZE + iconInterval;
                node.x = (posX);
                node.y = (54 - 12 + 10 + 20 - 10);
                if (value.functionId == FunctionConst.FUNC_ICON_MERGE) {
                    this._bagMergePosX = posX - this._panelDesign.width / 2;
                }
            }
        }
        var offset = G_ResolutionManager.getDeviceOffset();
        this._imgBtnBgIPX.node.active = (true);
        this._imgBtnBgNormal.node.active = (false);
        this._resetBagMergeBtns();
    }

    private _resetRightTop1() {
        //性能优化,先提出来防止后面多次计算
        this._activeFuncId = G_UserData.getLimitTimeActivity().getCurMainMenuLayerActivityIcon()[0];
        var starX = G_ResolutionManager.getBangDesignWidth() + 30;
        var menuList = this._createMenuList(this._right_top_a1);
        for (let i = 0; i < menuList.length; i++) {
            var value = menuList[i];
            var node: CommonMainMenu = value.node;
            if (node) {
                var posX = starX - (i + 1) * 75;
                node.node.x = (posX);
                node.node.y = (540);
                node.moveLetterToRight();
                var customData = value.customData;
                if (customData) {
                    if (customData.callFunc) {
                        customData.callFunc(node, value);
                    }
                    if (customData.icon) {
                        node.loadCustomIcon(customData.icon);
                    }
                }
            }
        }
    }

    private _resetRightBottom2() {

        var starX = G_ResolutionManager.getBangDesignWidth() + 30;
        var funBtnList = [];
        for (let k = 0; k < MainMenuLayer.RIGHT_BOTTOM_ICON_A2.length; k++) {
            var v = MainMenuLayer.RIGHT_BOTTOM_ICON_A2[k];
            funBtnList.push(v);

        }

        var menuList = this._createMenuList(funBtnList, null, false);

        for (let i = 0; i < menuList.length; i++) {
            var value = menuList[i];
            var node: CommonMainMenu = value.node;
            if (node) {
                var posX = starX - (i + 1) * 100;
                node.node.x = (posX);
                node.node.y = (178);
            }
            var customData = value.customData;
            if (customData) {
                if (customData.callFunc) {
                    customData.callFunc(node, value);
                }
            }
        }
    }
    private _resetRightBottom3() {
        var starX = G_ResolutionManager.getBangDesignWidth() + 30;
        var menuList = this._createMenuList(MainMenuLayer.RIGHT_BOTTOM_ICON_A3, null, false);
        for (let i = 0; i < menuList.length; i++) {
            var value = menuList[i];
            var node: CommonMainMenu = value.node;
            if (node) {
                var posX = starX - (i + 1) * 100;
                node.node.x = (posX);
                node.node.y = (278);
            }
            var customData = value.customData;
            if (customData) {
                if (customData.callFunc) {
                    customData.callFunc(node, value);
                }
            }
        }
    }

    private _resetRightTop2() {
        var starX = G_ResolutionManager.getBangDesignWidth() + 30;
        var funBtnList = [];
        for (let k = 0; k < MainMenuLayer.RIGHT_TOP_ICON_A2.length; k++) {
            let v = MainMenuLayer.RIGHT_TOP_ICON_A2[k];
            funBtnList.push(v);
        }
        //FUNC_CRYSTAL_SHOP 616
        //FUNC_DAILY_MISSION 8
        //FUNC_TASK_LIMIT 3001
        var questionList = G_UserData.getQuestionnaire().getQuestionList();
        for (let i = 0; i < questionList.length; i++) {
            let v = questionList[i];
            funBtnList.push({
                funcId: FunctionConst.FUNC_QUESTION,
                param: [v],
                funcSubId: v.getId()
            })
        }

        var menuList = this._createMenuList(funBtnList);

        // let taskLimitShow:number = -1;
        // let crystalShopP:number = -1;
        // for(let j = 0;j<menuList.length;j++)
        // {
        //     if(menuList[j].funcId==FunctionConst.FUNC_TASK_LIMIT)
        //     {
        //         taskLimitShow = j;
        //     }
        //     else if(menuList[j].funcId==FunctionConst.FUNC_CRYSTAL_SHOP)
        //     {
        //         crystalShopP = j;
        //     }
        // }
        // if(taskLimitShow>=0&&crystalShopP>=0)
        // {
        //     menuList.splice(taskLimitShow,1);
        //     menuList.reverse
        // }

        for (let i = 0; i < menuList.length; i++) {
            var value = menuList[i];
            var node: CommonMainMenu = value.node;
            if (node) {
                var posX = starX - (i + 1) * 75;
                node.node.x = (posX);
                node.node.y = (450);
                node.moveLetterToRight();
                if (value.customData != null) {
                    var customData = value.customData;
                    if (customData) {
                        if (customData.callFunc) {
                            customData.callFunc(node, value);
                        }
                        if (customData.icon) {
                            node.loadCustomIcon(customData.icon);
                        }
                    }
                }
            }

        }
    }

    private _resetMoreBtns() {
        var panelW = 590;
        var cols = 6;
        var spaceY = 106;
        var spaceX = 88;
        var offsetX = (panelW - spaceX * cols) / 2;
        var offsetY = 10;
        var menuList = this._createMenuList(this._more_icons, this._morePanel);
        var conH = Math.ceil(menuList.length / cols) * spaceY + 15;

        for (let i = 0; i < menuList.length; i++) {
            var value = menuList[i];
            var btn: CommonMainMenu = value.node;
            if (btn) {
                btn.node.x = (offsetX + spaceX / 2 + spaceX * ((i) % cols));
                // btn.node.y = (conH - spaceY / 2 - offsetY - Math.floor((i) / cols) * spaceY);
                btn.node.y = (- spaceY / 2 - offsetY - Math.floor((i) / cols) * spaceY);
            }
        }

        this._morePanel.setContentSize(panelW, conH);
    }

    private _resetTerritory(isShowFalseVisible?) {
        var menuList = this._createMenuList(MainMenuLayer.FUNC_TERRITORY, null, isShowFalseVisible);
        var curWidth = G_ResolutionManager.getBangDesignWidth();
        for (let i = 0; i < menuList.length; i++) {
            var value = menuList[i];
            var node: CommonMainMenu = value.node;
            if (node) {
                var posX = curWidth / 2 + (i - 1) * 100;
                node.node.x = (posX);
                node.node.y = (160);
                node.node.active = (value.isShow);
                var customData = value.customData;
                if (customData) {
                    if (customData.callFunc) {
                        customData.callFunc(node, value);
                    }
                }
            }

        }
    }

    private _setBtnMapData(btnName: string, btn: CommonMainMenu, menuData, imgRedDot) {
        if (this._btnMap[btnName] != null) {
            return;
        }
        this._btnMap[btnName] = { btn: btn, menuData: menuData };
        btn.addClickEventListenerEx(handler(this, this._onButtonClick));
        if (imgRedDot != null) {
            var funcId = menuData.functionId;
            this._setRedDotData(imgRedDot, funcId, btn.getButton());
        }
    }

    private _setRedDotData(imgRed: cc.Node, funcId: number, nodeBtn: cc.Button) {
        var redDotList = this._redDotMap[funcId];
        if (!redDotList) {
            redDotList = [];
            this._redDotMap[funcId] = redDotList;
        }
        redDotList.push({
            id: funcId,
            node: nodeBtn,
            imgRed: imgRed
        })
    }

    private _setIconMenuVisibleByMenuData(menuData, visible) {
        var funcInfo = menuData.cfg;
        var funcSubIdStr = menuData.funcSubId && menuData.funcSubId.toString() || '';
        var iconDataFunc = this._menusMapData['k' + (funcInfo.function_id + funcSubIdStr)];
        if (iconDataFunc != null && iconDataFunc.node != null) {
            iconDataFunc.node.node.active = (visible);
        }
    }

    private _createMenu(menuData: { cfg, functionId: number, funcSubId: number, customData, node: CommonMainMenu }, rootPanel: cc.Node) {

        var funcInfo = menuData.cfg;
        rootPanel = rootPanel || this._nodeBtn;
        var funcSubIdStr = menuData.funcSubId && menuData.funcSubId.toString() || '';
        var iconDataFunc = this._menusMapData['k' + (funcInfo.function_id + funcSubIdStr)];
        if (iconDataFunc != null && iconDataFunc.node != null) {
            iconDataFunc.node.node.active = true;
            iconDataFunc.customData = menuData.customData;
            return iconDataFunc;
        }
        let commonMainMenuPrefab = cc.resources.get("prefab/common/CommonMainMenu", cc.Prefab) as cc.Prefab;
        let node: cc.Node = cc.instantiate(commonMainMenuPrefab);
        var commonMainMenu = node.getComponent(CommonMainMenu);

        var customIcon;
        if (menuData.customData) {
            customIcon = menuData.customData.icon;
        }
        var iconShowFunctionId = null;
        if (menuData.customData) {
            iconShowFunctionId = menuData.customData.iconShowFunctionId;
        }
        commonMainMenu.updateUI(iconShowFunctionId || menuData.functionId, customIcon);
        //commonMainMenu.playBtnMoving();
        var button = commonMainMenu.getButton();
        button.node.name = ('commonMain' + funcInfo.function_id);
        node.name = ('commonMain' + funcInfo.function_id);
        rootPanel.addChild(node);
        menuData.node = commonMainMenu;
        menuData.node.node.active = true;
        this._menusMapData['k' + (funcInfo.function_id + funcSubIdStr)] = menuData;
        this._setBtnMapData(button.node.name, commonMainMenu, menuData, commonMainMenu.getRedPoint());
        return menuData;
    }


    private _onButtonClick(sender: cc.Node) {
        var menuData = this._btnMap[sender.name].menuData;
        if (menuData != null) {
            var mod = menuData.mod;
            var functionId = menuData.functionId;
            var param = menuData.funcData && menuData.funcData.param || null;
            WayFuncDataHelper.gotoModuleByFuncId(functionId, param);
        } else {
        }
        this._morePanel.active = false;
        this._morePanel.setScale(0);
    }

    private _onClickPanelInfo() {
        G_SceneManager.openPopup(Path.getPrefab("PopupPlayerDetail", "playerDetail"), (popup: PopupPlayerDetail) => {
            popup.openWithAction();
        })
        // var PopupPlayerDetail = new (require('PopupPlayerDetail'))();
        // PopupPlayerDetail.openWithAction();
    }

    private _updateRoleInfo() {
        var userBase = G_UserData.getBase();
        var exp = userBase.getExp();
        let level = userBase.getLevel()
        var roleData = G_ConfigLoader.getConfig(ConfigNameConst.ROLE).get(level);
        if (roleData) {
            this._playerExp.string = exp + ('/' + roleData.exp);
            var percent = exp / roleData.exp;
            this._playerExpBar.progress = percent;
        }
        var playerName = userBase.getName();
        var power = userBase.getPower();
        this._playerLevel.string = Lang.get('common_title_x_level', { level: level });
        var officelLevel = userBase.getOfficer_level()
        var officalInfo = userBase.getOfficialInfo();
        this._playerName.string = playerName;
        this._playerName.node.color = Colors.getOfficialColor(officelLevel);
        UIHelper.enableOutline(this._playerName, Colors.getOfficialColorOutline(officelLevel), 2);
        this._playerVip.loadVipImg(Path.getPlayerVip(G_UserData.getVip().getLevel()));
        this._playerPower.string = String(power);
        var isEquipAvatar = userBase.isEquipAvatar();
        this._commonHeroIcon.updateIcon(G_UserData.getBase().getPlayerShowInfo(), null, G_UserData.getHeadFrame().getCurrentFrame().getId());
        var bgSize = this._imagePlayerBg.node.getContentSize();
        this._imagePlayer.node.setPosition(bgSize.width / 2, bgSize.height / 2);
        this._imageAvatarBg.node.active = isEquipAvatar;
        this._imageAvatarCover.node.active = isEquipAvatar;
        this._imageAvatarCover.node.setPosition(bgSize.width / 2, bgSize.height / 2);
        if (!this._label) {
            this._label = new cc.Node().addComponent(CustomNumLabel);
            this._label.init('img_main_powernum', Path.getMainDir(), null, CustomNumLabel.SIGN_STR);
            this._label.registerRoll(this);
            this._nodePower.removeAllChildren();
            this._nodePower.addChild(this._label.node);
        }
        this._label.updateTxtValue(power);
    }

    public setNumberValue(value) {
        this._label.setString(TextHelper.getAmountText3(value, 1));
    }

    private getNumberValue() {
        return G_UserData.getBase().getPower();
    }

    private _signalHomelandBuffEmpty: any;
    private _signalGrainCarEnd: any;
    private _signalUniverseRaceSyncActInfo: any;
    private _signalUniverseRaceSwitchLayer: any;
    private _signalReturnCheckInSuccess: any;
    private _signalReturnRecvBonusSuccess: any;
    private _signalEventJunShiMiaojiExit: any;
    private _signalEventBossExit:any;
    protected onEnter1() {
        this._signalUserDataUpdate = G_SignalManager.add(SignalConst.EVENT_RECV_ROLE_INFO, handler(this, this._onEventUserDataUpdate));
        this._signalEventJunShiMiaojiExit = G_SignalManager.add(SignalConst.EVENT_JUN_SHI_MIAO_JI_EXIT, handler(this, this._onEventJunShiMiaojiExit));
        this._signalEventBossExit = G_SignalManager.add(SignalConst.EVENT_CROSS_GUILD_BOSS_EXIT,handler(this,this._onEventBossExit));
        this._signalUserLevelUpdate = G_SignalManager.add(SignalConst.EVENT_USER_LEVELUP, handler(this, this._onEventUserLevelUpdate));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalMainCityCheckBtns = G_SignalManager.add(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, handler(this, this._onEventMainCityCheckBtns));
        this._signalActivityNotice = G_SignalManager.add(SignalConst.EVENT_ACTIVITY_NOTICE, handler(this, this._onEventActivityNotice));
        this._signalVipExpChange = G_SignalManager.add(SignalConst.EVENT_VIP_EXP_CHANGE, handler(this, this._onEventVipExpChange));
        this._signalSendMineInfo = G_SignalManager.add(SignalConst.EVENT_SEND_MINE_INFO, handler(this, this._onSendMineInfo));
        this._signalRecvRecoverInfo = G_SignalManager.add(SignalConst.EVENT_RECV_RECOVER_INFO, handler(this, this._eventRecvRecoverInfo));
        this._signalShopNewRemindUpdate = G_SignalManager.add(SignalConst.EVENT_SHOP_NEW_REMIND_UPDATE, handler(this, this._updateShopNewRemind));
        this._signalRedPacketRainStartNotify = G_SignalManager.add(SignalConst.EVENT_RED_PACKET_RAIN_START_NOTIFY, handler(this, this._onEventRedPacketRainStartNotify));
        this._signalLoginSuccess = G_SignalManager.add(SignalConst.EVENT_LOGIN_SUCCESS, handler(this, this._onEventLoginSuccess));

        this._signalHomelandBuffEmpty = G_SignalManager.add(SignalConst.EVENT_HOME_LAND_BUFF_EMPTY, handler(this, this._onEventHomelandBuffEmpty));
        this._signalGrainCarEnd = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_END, handler(this, this._onEventGrainCarEnd));
        this._signalUniverseRaceSyncActInfo = G_SignalManager.add(SignalConst.EVENT_UNIVERSE_RACE_SYNC_ACTINFO, handler(this, this._onEventUniverseRaceSyncActInfo));
        this._signalUniverseRaceSwitchLayer = G_SignalManager.add(SignalConst.EVENT_UNIVERSE_RACE_SWITCH_LAYER, handler(this, this._onEventUniverseRaceSwitchLayer));
        this._signalReturnCheckInSuccess = G_SignalManager.add(SignalConst.EVENT_RETURN_CHECK_IN_SUCCESS, handler(this, this._onEventReturnCheckInSuccess));
        this._signalReturnRecvBonusSuccess = G_SignalManager.add(SignalConst.EVENT_RETURN_RECV_BONUS_SUCCESS, handler(this, this._onEventReturnRecvBonusSuccess));
        this._funcId2HeroReach = {};
        this.updateAll();
    }

    onEnter() {

        //this._playBtnEffect();
        this._checkCampRaceChampion();
        this._checkIsInGrave();
        this._updateShopNewRemind();

        //  G_UserData.getWorldBoss().c2sEnterWorldBoss();
        this._homelandBuff.updateUI();
    }
    onDisable(): void {
        if (this.wxGameQuan) {
            this.wxGameQuan.hide();
        }
    }
    //产生游戏圈按钮
    private produceGameFriends():void{
        if (cc.sys.platform == cc.sys.WECHAT_GAME && !this.wxGameQuan) {
            this.scheduleOnce(()=>{
                let name  = ('commonMain' + FunctionConst.FUNC_GAME_FRIENDS);
                let commonMainMenu = this._morePanel.getChildByName(name);
                let nodeActual = commonMainMenu.getComponent(CommonMainMenu).getButton().node;
                let sysInfo = wx.getSystemInfoSync();
                let rect = nodeActual.getBoundingBoxToWorld();
                let ratio = cc.view.getDevicePixelRatio();
                let scaleX = cc.view.getScaleX();
                let factorX = scaleX / ratio;
                let scaleY = cc.view.getScaleY();
                let factorY = scaleY / ratio;
                this.wxGameQuan = wx.createGameClubButton({
                    type:'text',
                    text:'',
                    style: {
                        left: rect.x * factorX,
                        top: sysInfo.windowHeight - (rect.y + rect.height) * factorY,
                        width: 40,
                        height: 40
                    }
                })
            },0.1)
        }
    }
    //更新游戏圈的显示
    private showGameQuan(value): void {
        if (value) {
            if(!this.wxGameQuan)
            {
                this.produceGameFriends();
            }
            if (this.wxGameQuan) {
                this.wxGameQuan.show();
            }
        }
        else {
            if (this.wxGameQuan) {
                this.wxGameQuan.hide();
            }
        }
    }
    private wxGameQuan: any;

    _initFuncMap() {
        this._funcResetMap = {};
        this._funcList = [
            MainMenuLayer.FUNC_TERRITORY,
            MainMenuLayer.OTHER_ICON,
            MainMenuLayer.MORE_ICON,
            MainMenuLayer.RIGHT_BOTTOM_ICON_A2,
            MainMenuLayer.RIGHT_BOTTOM_ICON_A3,
            MainMenuLayer.RIGHT_TOP_ICON_A2,
            MainMenuLayer.RIGHT_TOP_ICON_A1,
            MainMenuLayer.LEFT_BOTTOM_ICON
        ];
        var functionList = [
            this._resetTerritory,
            this._resetOtherBtn,
            this._resetMoreBtns,
            this._resetRightBottom2,
            this._resetRightBottom3,
            this._resetRightTop2,
            this._resetRightTop1,
            this._resetLeftBottom
        ];
        for (var i in this._funcList) {
            var v = this._funcList[i];
            for (var kk in v) {
                var vv: any = v[kk];
                this._funcResetMap[vv.funcId] = [
                    i,
                    functionList[i]
                ];
                for (var kkk in vv.replaceFuncIds || {}) {
                    var vvv = (vv.replaceFuncIds || {})[kkk];
                    this._funcResetMap[vvv.funcId] = [
                        i,
                        functionList[i]
                    ];
                }
            }
        }
        this._funcResetMap[FunctionConst.FUNC_QUESTION] = [
            5,
            this._resetRightTop2
        ];
    }

    private _updateShopNewRemind() {
        var redValue = ShopHelper.isHaveNewRemindShop();
        this._btnShop.showImageTip(redValue, Path.getTextSignet('txt_sg_new02'));
    }

    private _checkIsInGrave() {
        G_UserData.getQinTomb().c2sGraveEnterScene();
    }

    protected onExit() {
        this._openMore(false);
        this._openBagMerge(false);
        if (this.wxGameQuan) {
            this.wxGameQuan.hide();
        }
    }

    protected onCleanup() {
        this._signalEventBossExit.remove();
        this._signalEventBossExit = null;
        this._signalUserDataUpdate.remove();
        this._signalUserDataUpdate = null;
        this._signalEventJunShiMiaojiExit.remove();
        this._signalEventJunShiMiaojiExit = null;
        this._signalUserLevelUpdate.remove();
        this._signalUserLevelUpdate = null;
        this._signalMainCityCheckBtns.remove();
        this._signalMainCityCheckBtns = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalActivityNotice.remove();
        this._signalActivityNotice = null;
        this._signalVipExpChange.remove();
        this._signalVipExpChange = null;
        this._signalRecvRecoverInfo.remove();
        this._signalRecvRecoverInfo = null;
        this._signalSendMineInfo.remove();
        this._signalSendMineInfo = null;
        this._signalShopNewRemindUpdate.remove();
        this._signalShopNewRemindUpdate = null;
        this._signalRedPacketRainStartNotify.remove();
        this._signalRedPacketRainStartNotify = null;
        this._signalLoginSuccess.remove();
        this._signalLoginSuccess = null;

        this._signalHomelandBuffEmpty.remove();
        this._signalHomelandBuffEmpty = null;
        this._signalGrainCarEnd.remove();
        this._signalGrainCarEnd = null;
        this._signalUniverseRaceSyncActInfo.remove();
        this._signalUniverseRaceSyncActInfo = null;
        this._signalUniverseRaceSwitchLayer.remove();
        this._signalUniverseRaceSwitchLayer = null;
        this._signalReturnCheckInSuccess.remove();
        this._signalReturnCheckInSuccess = null;
        this._signalReturnRecvBonusSuccess.remove();
        this._signalReturnRecvBonusSuccess = null;

        G_ServiceManager.DeleteOneAlarmClock('SeasonMainBtn');
    }

    private _onPanelConTouch(sender, state) {
        this._openMore(false);
        this._openBagMerge(false);
    }

    private _openMore(boolValue) {
        var isOpenMore = this._morePanel.active;
        if (isOpenMore == boolValue) {
            return;
        }
        this._morePanel.stopAllActions();
        this._btnMore.flipButton(boolValue);
        //处理游戏圈显示逻辑
        this.showGameQuan(boolValue);
        if (boolValue == true) {
            this._morePanel.active = true;
            let actionOpen = cc.scaleTo(0.3, 1);
            let easeOpen = actionOpen.easing(cc.easeBackOut());
            let finishFunc = cc.callFunc(function () {
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "MainMenuLayer" + ': _openMore');
            });
            this._morePanel.runAction(cc.sequence(easeOpen, finishFunc));
            this.scheduleOnce(() => {
                this._morePanel.setScale(1);
            }, 0.3);
        } else {
            let actionClose = cc.scaleTo(0.2, 0);
            let easeClose = actionClose.easing(cc.easeExponentialOut());
            let seqClose = cc.sequence(easeClose, cc.callFunc(function (node) {
                node.active = false;
            }));
            this.scheduleOnce(() => {
                this._morePanel.setScale(0);
            }, 0.3);
            this._morePanel.runAction(seqClose);
        }
    }

    public onMoreBtn() {
        var isOpenMore = !this._morePanel.active;
        this._openMore(isOpenMore);
    }

    public onFightBtn() {
        G_SceneManager.showScene('chapter');
    }

    private _updateRedPointByFuncId(funcId, param?) {
        funcId = parseInt(funcId);
        if (funcId && funcId > 0) {
            var redDotList = this._redDotMap[funcId];
            if (redDotList) {
                var valueBool = RedPointHelper.isModuleReach(funcId);
                for (let k in redDotList) {
                    var redDot = redDotList[k];
                    if (redDot) {
                        var redPoint = redDot.imgRed;
                        redPoint.active = false;
                        if (valueBool == true) {
                            redPoint.active = true;
                        }
                        if (funcId == FunctionConst.FUNC_AUCTION) {
                            this.showEffectByFuncId(FunctionConst.FUNC_AUCTION, valueBool);
                        }
                    }
                }
            }
            // MainAvatorsNode _updateRedPointByFuncId
            //  else if (this._isInHeroAvatarFuncList(funcId)) {
            //     this._updateHeroAvatarRedPoint(funcId, param);
            // }
        }
    }

    private _onEventUserDataUpdate(_, param) {
        this._updateRoleInfo();
    }
    private _onEventJunShiMiaojiExit(): void {
        this._resetTerritory(true);
    }
    private _onEventBossExit():void{
        this._resetRightTop1();
    }

    private _onEventUserLevelUpdate(_, param) {
        this._delayResetButtons();
        this._nextFunctionOpen.updateUI();
        this._updateShopNewRemind();
    }
    _onEventDayUpdate(param) {
        this._delayResetButtons();
    }
    _onEventZeroClock() {
        this._delayResetButtons();
    }

    private _onEventRedPointUpdate(id, funcId, param) {
        var inTheMoreList = function (funcId) {

            for (let i = 0; i < this._more_icons.length; i++) {
                var value = this._more_icons[i];
                if (value.funcId == funcId) {
                    return true;
                }

            }
            return false;
        }.bind(this);
        this._resetTerritory(true);
        if (funcId && typeof (funcId) == 'number') {
            this._updateRedPointByFuncId(funcId, param);
            if (inTheMoreList(funcId)) {
                this._updateRedPointByFuncId(FunctionConst.FUNC_MORE, param);
            }
        } else {
            this._resetRedIcon();
        }
        this._updateHeadFrameRedPoint();
    }

    private _updateHeadFrameRedPoint() {
        var frameRed = G_UserData.getHeadFrame().hasRedPoint();
        var titleRed = G_UserData.getTitles().isHasRedPoint();
        if (titleRed || frameRed) {
            this._commonHeroIcon.setRedPointVisible(true);
        } else {
            this._commonHeroIcon.setRedPointVisible(false);
        }
    }

    private _onEventMainCityCheckBtns(_, param) {
        this._delayResetButtons(param);
        this._resetRedIcon();
    }

    private _isInHeroAvatarFuncList(funcId) {
        var list = [
            FunctionConst.FUNC_EQUIP,
            FunctionConst.FUNC_TREASURE,
            FunctionConst.FUNC_INSTRUMENT,
            FunctionConst.FUNC_HORSE,
            FunctionConst.FUNC_HERO_TRAIN_TYPE1,
            FunctionConst.FUNC_HERO_TRAIN_TYPE2,
            FunctionConst.FUNC_HERO_TRAIN_TYPE3,
            FunctionConst.FUNC_HERO_TRAIN_TYPE4,
            FunctionConst.FUNC_EQUIP_TRAIN_TYPE1,
            FunctionConst.FUNC_EQUIP_TRAIN_TYPE2,
            FunctionConst.FUNC_TREASURE_TRAIN_TYPE1,
            FunctionConst.FUNC_TREASURE_TRAIN_TYPE2,
            FunctionConst.FUNC_TREASURE_TRAIN_TYPE3,
            FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1,
            FunctionConst.FUNC_HORSE_TRAIN,
            FunctionConst.FUNC_HERO_KARMA,
            FunctionConst.FUNC_TACTICS
        ];

        for (let i = 0; i < list.length; i++) {
            var id = list[i];
            if (id == funcId) {
                return true;
            }

        }
        return false;
    }

    private _onEventActivityNotice(id, param) {
        this._delayResetButtons(param);
    }

    private _onEventVipExpChange(event) {
        this._updateRoleInfo();
    }

    private _onSendMineInfo() {
        this._updateRedPointByFuncId(FunctionConst.FUNC_MINE_CRAFT);
    }

    // MainAvatorsNode _updateHeroAvatarRedPoint
    // private _updateHeroAvatarRedPoint(funcId, param) {

    // }

    private _eventRecvRecoverInfo() {
        this._resetOtherBtn();
        this._resetRightBottom2();
    }

    private _checkCampRaceChampion() {
        var champions = G_UserData.getCampRaceData().getChampion();
        var count = 0;
        for (let camp in champions) {
            var user = champions[camp];
            count = count + 1;
        }
        if (count == 0) {
            G_UserData.getCampRaceData().c2sGetCampRaceChampion();
        }
    }

    private _onEventRedPacketRainStartNotify() {
        this._resetTerritory();
    }

    private _onEventLoginSuccess() {
        this._delayResetButtons();
        //this._resetRedIcon();
    }

    _onEventHomelandBuffEmpty() {
        this._homelandBuff.updateUI();
    }
    _onEventGrainCarEnd() {
        this._delayResetButtons(FunctionConst.FUNC_GRAIN_CAR);
    }
    _onEventUniverseRaceSyncActInfo() {
        this._delayResetButtons(FunctionConst.FUNC_UNIVERSE_RACE);
    }
    _onEventUniverseRaceSwitchLayer(eventName, layerState) {
        if (layerState == UniverseRaceConst.LAYER_STATE_CHAMPION) {
            this._delayResetButtons(FunctionConst.FUNC_UNIVERSE_RACE_CHAMPION);
        }
    }
    _onEventReturnCheckInSuccess(eventName) {
        this._delayResetButtons(FunctionConst.FUNC_RETURN_CONFIRM);
    }
    _onEventReturnRecvBonusSuccess(eventName) {
        var returnSvr = G_UserData.getBase().getReturnSvr();
        if (returnSvr && returnSvr.isAllReceived()) {
            this._delayResetButtons(FunctionConst.FUNC_RETURN_AWARD);
        }
    }


    private getParameter(keyIndex) {
        var parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        for (let i = 0; i < parameter.length(); i++) {
            var itemData = parameter.indexOf(i);
            if (itemData.key == keyIndex) {
                return itemData.content;
            }
        }
        return null;
    }

    private static ICON_INTERVAL = 45;
    private static ICON_SIZE = 89;

    private static RIGHT_TOP_ICON_INTERVAL = 82;
    private static TIP_FONT_SIZE = 16;
    private static TIP_POSITION = cc.v3(0, -30 - 14);
    private static TIP_COLOR = new cc.Color(0, 255, 0);
    private static TIP_OUTLINE_COLOR = new cc.Color(0, 0, 0);

    //左下按钮
    private static LEFT_BOTTOM_ICON = [
        { funcId: FunctionConst.FUNC_TEAM },
        { funcId: FunctionConst.FUNC_HERO_LIST },
        { funcId: FunctionConst.FUNC_EQUIP_LIST },
        { funcId: FunctionConst.FUNC_TREASURE_LIST },
        { funcId: FunctionConst.FUNC_INSTRUMENT_LIST },
        { funcId: FunctionConst.FUNC_DRAW_HERO },
        { funcId: FunctionConst.FUNC_ITEM_BAG },
        { funcId: FunctionConst.FUNC_PET_HOME },
        { funcId: FunctionConst.FUNC_HORSE },
        { funcId: FunctionConst.FUNC_TACTICS },
        { funcId: FunctionConst.FUNC_BOUT }
    ];

    private static LEFT_BOTTOM_ICON_MERGE = [
        { funcId: FunctionConst.FUNC_TEAM },
        { funcId: FunctionConst.FUNC_HERO_LIST },
        { funcId: FunctionConst.FUNC_DRAW_HERO },
        { funcId: FunctionConst.FUNC_ICON_MERGE },
        { funcId: FunctionConst.FUNC_PET_HOME },
        { funcId: FunctionConst.FUNC_HORSE },
        { funcId: FunctionConst.FUNC_TACTICS },
        { funcId: FunctionConst.FUNC_BOUT }
    ];

    public static BAG_MERGE = [
        { funcId: FunctionConst.FUNC_ITEM_BAG2 },
        { funcId: FunctionConst.FUNC_EQUIP_LIST },
        { funcId: FunctionConst.FUNC_TREASURE_LIST },
        { funcId: FunctionConst.FUNC_INSTRUMENT_LIST }
    ];

    //左下按钮80级以后
    private static LEFT_BOTTOM_ICON_LV80 = [
        { funcId: FunctionConst.FUNC_TEAM },
        { funcId: FunctionConst.FUNC_HERO_LIST },
        { funcId: FunctionConst.FUNC_DRAW_HERO },
        { funcId: FunctionConst.FUNC_ITEM_BAG },
        { funcId: FunctionConst.FUNC_PET_HOME },
        { funcId: FunctionConst.FUNC_HORSE }
    ];

    private static RIGHT_TOP_ICON_A1 = [
        { funcId: FunctionConst.FUNC_ACTIVITY },
        { funcId: FunctionConst.FUNC_CARNIVAL_ACTIVITY },
        { funcId: FunctionConst.FUNC_GROWTH_FUND },
        { funcId: FunctionConst.FUNC_DAILY_GIFT_PACK },
        { funcId: FunctionConst.FUNC_WELFARE },
        {
            funcId: FunctionConst.FUNC_RECHARGE,
            replaceFuncIds: [{ funcId: FunctionConst.FUNC_JADE2 }]
        },
        { funcId: FunctionConst.FUNC_VIP_GIFT },
        { funcId: FunctionConst.FUNC_FIRST_RECHARGE },
        { funcId: FunctionConst.FUNC_AUCTION },

        { funcId: FunctionConst.FUNC_WORLD_BOSS },
        { funcId: FunctionConst.FUNC_GUILD_ANSWER },
        { funcId: FunctionConst.FUNC_GUILD_SERVER_ANSWER },
        // { funcId: FunctionConst.FUNC_GUILD_DUNGEON },
        { funcId: FunctionConst.FUNC_RECHARGE_REBATE },
        { funcId: FunctionConst.FUNC_COUNTRY_BOSS },
        { funcId: FunctionConst.FUNC_CAMP_RACE },
        { funcId: FunctionConst.FUNC_RUNNING_MAN },
        { funcId: FunctionConst.FUNC_GUILD_WAR },
        { funcId: FunctionConst.FUNC_GACHA_GOLDENHERO },
        { funcId: FunctionConst.FUNC_CAKE_ACTIVITY },
        { funcId: FunctionConst.FUNC_GRAIN_CAR },
        { funcId: FunctionConst.FUNC_CROSS_WORLD_BOSS },
        { funcId: FunctionConst.FUNC_WX_SERVICE },
    ];

    //右上按钮第二排
    private static RIGHT_TOP_ICON_A2 = [
        { funcId: FunctionConst.FUNC_SUPER_CHARGE_GIFT },
        { funcId: FunctionConst.FUNC_SEVEN_DAY_RECHARGE },
        { funcId: FunctionConst.FUNC_RED_PET },
        { funcId: FunctionConst.FUNC_WEEK_ACTIVITY },
        { funcId: FunctionConst.FUNC_TASK_LIMIT },
        { funcId: FunctionConst.FUNC_DAILY_MISSION },
        { funcId: FunctionConst.FUNC_CRYSTAL_SHOP },
        { funcId: FunctionConst.FUNC_LINKAGE_ACTIVITY },
        { funcId: FunctionConst.FUNC_LINKAGE_ACTIVITY2 },
        { funcId: FunctionConst.FUNC_CAMP_RACE_CHAMPION },
        { funcId: FunctionConst.FUNC_AVOID_GAME },
        { funcId: FunctionConst.FUNC_SUPER_VIP },
        { funcId: FunctionConst.FUNC_SUPER_VIP_2 },
        { funcId: FunctionConst.FUNC_OPPO_FORUM },
        { funcId: FunctionConst.FUNC_GROUPS },
        { funcId: FunctionConst.FUNC_SEASONSOPRT },
        { funcId: FunctionConst.FUNC_SINGLE_RACE },
        { funcId: FunctionConst.FUNC_SINGLE_RACE_CHAMPION },
        { funcId: FunctionConst.FUNC_RETURN },
        { funcId: FunctionConst.FUNC_GUILD_CROSS_WAR },
        { funcId: FunctionConst.FUNC_UNIVERSE_RACE },
        { funcId: FunctionConst.FUNC_UNIVERSE_RACE_CHAMPION },
        { funcId: FunctionConst.FUNC_TEN_JADE_AUCTION },
        { funcId: FunctionConst.FUNC_RETURN_CONFIRM },
        { funcId: FunctionConst.FUNC_RETURN_AWARD },
        { funcId: FunctionConst.FUNC_TSHIRT }
    ];
    //右下第二排按钮 征战按钮上面
    private static RIGHT_BOTTOM_ICON_A2 = [
        { funcId: FunctionConst.FUNC_TRAVEL },
        { funcId: FunctionConst.FUNC_MINE_CRAFT },
        { funcId: FunctionConst.FUNC_HOMELAND }
    ];
    //右下第三排按钮 征战按钮上面
    private static RIGHT_BOTTOM_ICON_A3 = [
        { funcId: FunctionConst.FUNC_WX_SHARE },
    ];

    //更多按钮
    public static MORE_ICON = [
        {funcId:FunctionConst.FUNC_GAME_FRIENDS}, //游戏圈
        { funcId: FunctionConst.FUNC_HAND_BOOK },
        { funcId: FunctionConst.FUNC_RANK },
        { funcId: FunctionConst.FUNC_OFFICIAL },
        { funcId: FunctionConst.FUNC_RECYCLE },
        { funcId: FunctionConst.FUNC_CONVERT },
        { funcId: FunctionConst.FUNC_GIFT_ECHANGE },
        { funcId: FunctionConst.FUNC_BECOME_STRONGER },
        { funcId: FunctionConst.FUNC_FRIEND },
        { funcId: FunctionConst.FUNC_TEAM_SUGGEST },
        { funcId: FunctionConst.FUNC_MAIL },
        { funcId: FunctionConst.FUNC_SYNTHESIS },
        { funcId: FunctionConst.FUNC_SYSTEM_SET },
        { funcId: FunctionConst.FUNC_AVATAR_MORE_BTN },
        { funcId: FunctionConst.FUNC_RICH_MAN_INFO_COLLECT },
        { funcId: FunctionConst.FUNC_WX_COLLECT }
    ];
    //OtherList
    private static OTHER_ICON = [
        { funcId: FunctionConst.FUNC_MORE },
        { funcId: FunctionConst.FUNC_SHOP_SCENE },
        { funcId: FunctionConst.FUNC_MAIN_STRONGER },
        { funcId: FunctionConst.FUNC_ADVENTURE },
        { funcId: FunctionConst.FUNC_ARMY_GROUP },
        { funcId: FunctionConst.FUNC_INDULGE }
    ];
    private static FUNC_VIEW = [{ funcId: FunctionConst.FUNC_CHAT }];

    //领地
    private static FUNC_TERRITORY = [
        { funcId: FunctionConst.FUNC_PATROL_AWARDS },
        { funcId: FunctionConst.FUNC_RIOT_AWARDS },
        { funcId: FunctionConst.FUNC_RIOT_HAPPEN },
        { funcId: FunctionConst.FUNC_RIOT_HELP },
        { funcId: FunctionConst.FUNC_MAIL_RED },
        { funcId: FunctionConst.FUNC_JUN_SHI_MIAO_JI },
        { funcId: FunctionConst.FUNC_ACTIVITY_RESOURCE_BACK },
        { funcId: FunctionConst.FUNC_ENEMY_REVENGE_LOG },
        { funcId: FunctionConst.FUNC_CHAPTER_BOSS },
        { funcId: FunctionConst.FUNC_RED_PACKET_RAIN }
    ];
}
