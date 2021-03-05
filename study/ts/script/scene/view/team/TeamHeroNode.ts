const { ccclass, property } = cc._decorator;

import AttributeConst from '../../../const/AttributeConst';
import { AudioConst } from '../../../const/AudioConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { HeroConst } from '../../../const/HeroConst';
import HorseConst from '../../../const/HorseConst';
import MasterConst from '../../../const/MasterConst';
import { SignalConst } from '../../../const/SignalConst';
import UIConst from '../../../const/UIConst';
import { AttrRecordUnitData } from '../../../data/AttrRecordUnitData';
import { HeroUnitData } from '../../../data/HeroUnitData';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { Colors, G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_HeroVoiceManager, G_Prompt, G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAttrNode from '../../../ui/component/CommonAttrNode';
import CommonDesValue from '../../../ui/component/CommonDesValue';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import CommonHeroCountry from '../../../ui/component/CommonHeroCountry';
import CommonHeroName from '../../../ui/component/CommonHeroName';
import CommonHeroPower from '../../../ui/component/CommonHeroPower';
import CommonHeroStar from '../../../ui/component/CommonHeroStar';
import CommonSkillIcon from '../../../ui/component/CommonSkillIcon';
import CommonUI from '../../../ui/component/CommonUI';
import CommonVerticalText from '../../../ui/component/CommonVerticalText';
import PopupChooseEquip2 from '../../../ui/popup/PopupChooseEquip2';
import { PopupChooseEquipHelper } from '../../../ui/popup/PopupChooseEquipHelper';
import PopupChooseHeroHelper from '../../../ui/popup/PopupChooseHeroHelper';
import PopupChooseHorse from '../../../ui/popup/PopupChooseHorse';
import { PopupChooseHorseHelper } from '../../../ui/popup/PopupChooseHorseHelper';
import PopupChooseInstrument from '../../../ui/popup/PopupChooseInstrument';
import PopupChooseInstrumentHelper from '../../../ui/popup/PopupChooseInstrumentHelper';
import PopupChooseTreasure2 from '../../../ui/popup/PopupChooseTreasure2';
import { PopupChooseTreasureHelper } from '../../../ui/popup/PopupChooseTreasureHelper';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { EquipDataHelper } from '../../../utils/data/EquipDataHelper';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { TeamDataHelper } from '../../../utils/data/TeamDataHelper';
import { unpack } from '../../../utils/GlobleFunc';
import { handler } from '../../../utils/handler';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIActionHelper from '../../../utils/UIActionHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import PopupMasterLevelup from '../equipment/PopupMasterLevelup';
import { EquipMasterHelper } from '../equipTrain/EquipMasterHelper';
import { EquipTrainHelper } from '../equipTrain/EquipTrainHelper';
import PopupEquipMaster from '../equipTrain/PopupEquipMaster';
import HeroGoldHelper from '../heroGoldTrain/HeroGoldHelper';
import HeroTrainHelper from '../heroTrain/HeroTrainHelper';
import PopupHeroKarma from '../heroTrain/PopupHeroKarma';
import PopupActiveJoint from './PopupActiveJoint';
import PopupAttrDetail from './PopupAttrDetail';
import PopupHeroYoke from './PopupHeroYoke';
import TeamEquipIcon from './TeamEquipIcon';
import TeamHistoryHeroIcon from './TeamHistoryHeroIcon';
import TeamHorseIcon from './TeamHorseIcon';
import TeamInstrumentIcon from './TeamInstrumentIcon';
import TeamTreasureIcon from './TeamTreasureIcon';
import TeamViewHelper from './TeamViewHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { TreasureTrainHelper } from '../treasureTrain/TreasureTrainHelper';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { table } from '../../../utils/table';
import TeamTacticsPositionIcon from './TeamTacticsPositionIcon';
import { Slot } from '../../../utils/event/Slot';















let RECORD_ATTR_LIST = [
    [
        AttributeConst.ATK,
        '_fileNodeAttr1'
    ],
    [
        AttributeConst.HP,
        '_fileNodeAttr3'
    ],
    [
        AttributeConst.PD,
        '_fileNodeAttr2'
    ],
    [
        AttributeConst.MD,
        '_fileNodeAttr4'
    ],
    [
        AttributeConst.CRIT,
        null
    ],
    [
        AttributeConst.NO_CRIT,
        null
    ],
    [
        AttributeConst.HIT,
        null
    ],
    [
        AttributeConst.NO_HIT,
        null
    ],
    [
        AttributeConst.HURT,
        null
    ],
    [
        AttributeConst.HURT_RED,
        null
    ]
];

@ccclass
export default class TeamHeroNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelAttr: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBasic: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeDetailTitleBasic: CommonDetailTitleWithBg = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeLevel: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodePotential: CommonDesValue = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _fileNodeAttr1: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _fileNodeAttr2: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _fileNodeAttr3: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _fileNodeAttr4: CommonAttrNode = null;

    @property({
        type: CommonSkillIcon,
        visible: true
    })
    _fileNodeSkill1: CommonSkillIcon = null;

    @property({
        type: CommonSkillIcon,
        visible: true
    })
    _fileNodeSkill2: CommonSkillIcon = null;

    @property({
        type: CommonSkillIcon,
        visible: true
    })
    _fileNodeSkill3: CommonSkillIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelAttrTouch: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTactics: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeDetailTitleTactics: CommonDetailTitleWithBg = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelKarma: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeDetailTitleKarma: CommonDetailTitleWithBg = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageKarmaTip: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageKarmaRedPoint: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgLine1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenBg1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenMark1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textYuanFenDes1: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenBg2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenMark2: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textYuanFenDes2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenBg3: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenMark3: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textYuanFenDes3: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenBg4: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenMark4: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textYuanFenDes4: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenBg5: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenMark5: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textYuanFenDes5: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenBg6: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenMark6: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textYuanFenDes6: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenBg7: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenMark7: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textYuanFenDes7: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenBg8: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenMark8: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textYuanFenDes8: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenBg9: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenMark9: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textYuanFenDes9: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenBg10: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageYuanFenMark10: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textYuanFenDes10: cc.Label = null;



    @property({
        type: cc.Node,
        visible: true
    })
    _nodePanelYoke: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelYoke: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeDetailTitleYoke: CommonDetailTitleWithBg = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageJiBanMark1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textJiBanDes1: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageJiBanMark2: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textJiBanDes2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageJiBanMark3: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textJiBanDes3: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageJiBanMark4: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textJiBanDes4: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageJiBanMark5: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textJiBanDes5: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageJiBanMark6: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textJiBanDes6: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelNoYoke: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInTop: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageAwakeBg: cc.Sprite = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _nodeHeroStar: CommonHeroStar = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonAwake: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageAwakeRedPoint: cc.Sprite = null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeHeroName: CommonHeroName = null;

    @property({
        type: CommonHeroCountry,
        visible: true
    })
    _fileNodeCountry: CommonHeroCountry = null;

    @property({
        type: CommonVerticalText,
        visible: true
    })
    _fileNodeFeature: CommonVerticalText = null;

    @property({
        type: TeamEquipIcon,
        visible: true
    })
    _fileNodeEquip1: TeamEquipIcon = null;

    @property({
        type: TeamEquipIcon,
        visible: true
    })
    _fileNodeEquip2: TeamEquipIcon = null;

    @property({
        type: TeamEquipIcon,
        visible: true
    })
    _fileNodeEquip3: TeamEquipIcon = null;

    @property({
        type: TeamEquipIcon,
        visible: true
    })
    _fileNodeEquip4: TeamEquipIcon = null;

    @property({
        type: TeamTreasureIcon,
        visible: true
    })
    _fileNodeTreasure1: TeamTreasureIcon = null;

    @property({
        type: TeamTreasureIcon,
        visible: true
    })
    _fileNodeTreasure2: TeamTreasureIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInInstrument: cc.Node = null;

    @property({
        type: TeamInstrumentIcon,
        visible: true
    })
    _fileNodeInstrument: TeamInstrumentIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInHorse: cc.Node = null;

    @property({
        type: TeamHorseIcon,
        visible: true
    })
    _fileNodeHorse: TeamHorseIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInHistoryHero: cc.Node = null;

    @property({
        type: TeamHistoryHeroIcon,
        visible: true
    })
    _fileNodeHistoryHero: TeamHistoryHeroIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInPower: cc.Node = null;

    @property({
        type: CommonHeroPower,
        visible: true
    })
    _fileNodePower: CommonHeroPower = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBtnBg: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonMaster: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonOneKey: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonChange: cc.Button = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _buttonPet: CommonMainMenu = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageChangeRP: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonAvatar: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageAvatarRP: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonSilkbag: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSilkbagRP: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonHistoryHero: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageHistoryHeroRP: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTactics1: cc.Node = null;
    @property({
        type: TeamTacticsPositionIcon,
        visible: true
    })
    _fileNodeTactics1: TeamTacticsPositionIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTactics2: cc.Node = null;
    @property({
        type: TeamTacticsPositionIcon,
        visible: true
    })
    _fileNodeTactics2: TeamTacticsPositionIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTactics3: cc.Node = null;
    @property({
        type: TeamTacticsPositionIcon,
        visible: true
    })
    _fileNodeTactics3: TeamTacticsPositionIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _imageTacticsRedPoint: cc.Node = null;

    private _isInstrumentShow: boolean;
    private _allYokeData: any;
    private _needPopupEquipReplace: boolean;
    private _needEquipClearPrompt: boolean;
    private _needPopupTreasureReplace: boolean;
    private _needPopupInstrumentReplace: boolean;
    private _needPopupHorseReplace: boolean;
    private _needTreasureRemovePrompt: boolean;
    private _needInstrumentRemovePrompt: boolean;
    private _needHorseRemovePrompt: boolean;
    private _changeOldHeroId: number;
    private _recordAttr: AttrRecordUnitData;
    private _curHeroData: HeroUnitData;

    private _lastHeroLevel: any;
    private _lastHeroRank: any;
    private _lastHeroAwake: any;
    private _lastHeroLimit: any;
    private _lastEquipLevel: any;
    private _lastEquipRLevel: any;
    private _lastTreasureLevel: any;
    private _lastTreasureRLevel: any;
    private _lastInstrumentLevel: any;
    private _lastHorseLevel: any;
    private _lastHistoryHeroLevel: any;
    private _lastEquipStrMasterLevel: any;
    private _diffEquipStrMasterLevel = 0;
    private _lastEquipStrMasterInfo = null;
    private _lastEquipRefineMasterLevel: any;
    private _diffEquipRefineMasterLevel = 0;
    private _lastTreasureStrMasterLevel: any;
    private _diffTreasureStrMasterLevel = 0;
    private _lastTreasureRefineMasterLevel: any;
    private _diffTreasureRefineMasterLevel = 0;
    private _oneKeyEquipIndexs: any;
    private _enterEffects: any;

    private _instrument: TeamInstrumentIcon;
    private _horse: TeamHorseIcon;

    private _signalChangeHeroFormation: any;
    private _signalHeroKarmaActive: any;
    private _signalEquipAddSuccess: any;
    private _signalTreasureAddSuccess: any;
    private _signalInstrumentAddSuccess: any;
    private _signalHorseAddSuccess: any;
    private _signalHorseRemoveSuccess: any;
    private _signalEquipSuperUpgrade: any;
    private _popupKarmaSignal: any;

    private _parentView: any;

    private _btnTreasureShowRP: boolean;
    private _btnEquipShowRP: boolean;
    private _btnInstrumentShowRP: boolean;
    private _btnHorseShowRP: boolean;
    private _karamOffset: number = 0;
    private _signalUserLevelup: Slot;
    private _signalTacticsPosUnlock: Slot;
    private _signalTacticsAddSuccess: Slot;
    private _signalTacticsRemoveSuccess: Slot;
    private _signalHistoryHeroFormationUpdate: Slot;
    private _animationEnd: boolean;
    isTacticsShow: any;
    @property({
        type: cc.Node,
        visible: true
    }) _scAttr: cc.Node = null;
    public setInitData(pv): void {
        this._parentView = pv;
        this.node.name = "TeamHeroNode";
    }

    public onLoad(): void {
        super.onLoad();
        let size = G_ResolutionManager.getDesignSize();
        this.node.setContentSize(size[0], size[1]);
    }

    onCreate() {
        this.setSceneSize();
        this._panelAttrTouch.on(cc.Node.EventType.TOUCH_END, this._onAttrClicked, this);
        var clickEvent = new cc.Component.EventHandler();
        clickEvent.handler = "onButtonAwakeClicked";
        clickEvent.target = this.node;
        clickEvent.component = "TeamHeroNode";
        this._buttonAwake.clickEvents = [];
        this._buttonAwake.clickEvents.push(clickEvent);
        this._karamOffset = 0;
        this._initData();
        this._initView();
    }
    _initData() {
        this._isInstrumentShow = false;
        this._allYokeData = {};
        this._needPopupEquipReplace = false;
        this._needEquipClearPrompt = false;
        this._needPopupTreasureReplace = false;
        this._needPopupInstrumentReplace = false;
        this._needPopupHorseReplace = false;
        this._needTreasureRemovePrompt = false;
        this._needInstrumentRemovePrompt = false;
        this._needHorseRemovePrompt = false;
        this._changeOldHeroId = 0;
        let curPos = G_UserData.getTeam().getCurPos();
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst['FUNC_TEAM_SLOT' + curPos]);
        this._lastHeroLevel = {};
        this._lastHeroRank = {};
        this._lastHeroAwake = {};
        this._lastHeroLimit = {};
        this._lastEquipLevel = {};
        this._lastEquipRLevel = {};
        this._lastTreasureLevel = {};
        this._lastTreasureRLevel = {};
        this._lastInstrumentLevel = {};
        this._lastHorseLevel = {};
        this._lastEquipStrMasterLevel = {};
        this._diffEquipStrMasterLevel = 0;
        this._lastEquipStrMasterInfo = null;
        this._lastEquipRefineMasterLevel = {};
        this._diffEquipRefineMasterLevel = 0;
        this._lastTreasureStrMasterLevel = {};
        this._diffTreasureStrMasterLevel = 0;
        this._lastTreasureRefineMasterLevel = {};
        this._diffTreasureRefineMasterLevel = 0;
        this._oneKeyEquipIndexs = {};
        this._enterEffects = {};


    }
    private _popupKarma: PopupHeroKarma;
    _initView() {
        this._popupKarma = null;
        this._nodeDetailTitleBasic.setTitle(Lang.get('team_detail_title_basic'));
        this._nodeDetailTitleTactics.setTitle(Lang.get('team_detail_title_tactics'));
        this._nodeDetailTitleKarma.setTitle(Lang.get('team_detail_title_karma'));
        this._nodeDetailTitleYoke.setTitle(Lang.get('team_detail_title_yoke'));
        this._nodeLevel.setFontSize(20);
        this._nodePotential.setFontSize(20);
        this._initTacticsNode();
        for (let i = 1; i <= 2; i++) {
            (this['_fileNodeTreasure' + i] as TeamTreasureIcon).setInitData(true)
        }
        this._instrument = this._fileNodeInstrument;
        this._horse = this._fileNodeHorse;


    }
    _initTacticsNode() {

    }
    onEnter() {
        this._signalChangeHeroFormation = G_SignalManager.add(SignalConst.EVENT_CHANGE_HERO_FORMATION_SUCCESS, handler(this, this._changeHeroFormation));
        this._signalHeroKarmaActive = G_SignalManager.add(SignalConst.EVENT_HERO_KARMA_ACTIVE_SUCCESS, handler(this, this._heroKarmaActiveSuccess));
        this._signalEquipAddSuccess = G_SignalManager.add(SignalConst.EVENT_EQUIP_ADD_SUCCESS, handler(this, this._equipAddSuccess));
        this._signalTreasureAddSuccess = G_SignalManager.add(SignalConst.EVENT_TREASURE_ADD_SUCCESS, handler(this, this._treasureAddSuccess));
        this._signalInstrumentAddSuccess = G_SignalManager.add(SignalConst.EVENT_INSTRUMENT_ADD_SUCCESS, handler(this, this._instrumentAddSuccess));
        this._signalHorseAddSuccess = G_SignalManager.add(SignalConst.EVENT_HORSE_ADD_SUCCESS, handler(this, this._horseAddSuccess));
        this._signalHorseRemoveSuccess = G_SignalManager.add(SignalConst.EVENT_HORSE_CLEAR_SUCCESS, handler(this, this._horseRemoveSuccess));
        this._signalEquipSuperUpgrade = G_SignalManager.add(SignalConst.EVENT_EQUIP_SUPER_UPGRADE_SUCCESS, handler(this, this._onEventEquipSuperUpgrade));
        this._signalHistoryHeroFormationUpdate = G_SignalManager.add(SignalConst.EVENT_HISTORY_HERO_FORMATIONUPDATE, handler(this, this._onHistoryHeroFormationUpdate));
        this._signalUserLevelup = G_SignalManager.add(SignalConst.EVENT_USER_LEVELUP, handler(this, this._onUserLevelup));
        this._signalTacticsPosUnlock = G_SignalManager.add(SignalConst.EVENT_TACTICS_UNLOCK_POSITION, handler(this, this._onTacticsPosUnlock));
        this._signalTacticsAddSuccess = G_SignalManager.add(SignalConst.EVENT_TACTICS_ADD_SUCCESS, handler(this, this._onTacticsAddSuccess));
        this._signalTacticsRemoveSuccess = G_SignalManager.add(SignalConst.EVENT_TACTICS_REMOVE_SUCCESS, handler(this, this._onTacticsRemoveSuccess));
        this._buttonPet.updateUI(FunctionConst.FUNC_PET_HOME);
        this._buttonPet.addClickEventListenerEx(handler(this, this._onClickButtonPet));

        if (G_UserData.getTeam().getCurPos() < 1 || G_UserData.getTeam().getCurPos() > 6) {
            return;
        }
        G_AudioManager.preLoadSoundWithId(AudioConst.SOUND_TACTICS_POSITION_UNLOCK);
        this._onEquipEvent();
        this._onTreasureEvent();
        this._onInstrumentEvent();
        this._onHorseEvent();
        //this._updateData();
        if (this._needTreasureRemovePrompt) {
            this._playRemoveTreasureSummary();
            this._needTreasureRemovePrompt = false;
        } else {
            //this._updateView();
        }
    }
    onExit() {
        this._signalChangeHeroFormation.remove();
        this._signalChangeHeroFormation = null;
        this._signalHeroKarmaActive.remove();
        this._signalHeroKarmaActive = null;
        this._signalEquipAddSuccess.remove();
        this._signalEquipAddSuccess = null;
        this._signalTreasureAddSuccess.remove();
        this._signalTreasureAddSuccess = null;
        this._signalInstrumentAddSuccess.remove();
        this._signalInstrumentAddSuccess = null;
        this._signalHorseAddSuccess.remove();
        this._signalHorseAddSuccess = null;
        this._signalHorseRemoveSuccess.remove();
        this._signalHorseRemoveSuccess = null;
        this._signalEquipSuperUpgrade.remove();
        this._signalEquipSuperUpgrade = null;
        this._signalHistoryHeroFormationUpdate.remove();
        this._signalHistoryHeroFormationUpdate = null;
        this._signalUserLevelup.remove();
        this._signalUserLevelup = null;
        this._signalTacticsPosUnlock.remove();
        this._signalTacticsPosUnlock = null;
        this._signalTacticsAddSuccess.remove();
        this._signalTacticsAddSuccess = null;
        this._signalTacticsRemoveSuccess.remove();
        this._signalTacticsRemoveSuccess = null;
        if (this._curHeroData) {
            this._lastHeroLevel = [
                this._curHeroData.getId(),
                this._curHeroData.getLevel()
            ];
            this._lastHeroRank = [
                this._curHeroData.getId(),
                this._curHeroData.getRank_lv()
            ];
            this._lastHeroAwake = [
                this._curHeroData.getId(),
                this._curHeroData.getAwaken_level()
            ];
            this._lastHeroLimit = [
                this._curHeroData.getId(),
                this._curHeroData.getLimit_level()
            ];
            this._recordEquipLevel();
            this._recordTreasureLevel();
            this._recordInstrumentLevel();
            this._recordHorseStar();
            this._recordHistoryHeroStep();
        }
        G_UserData.getTeamCache().setShowHeroTrainFlag(false);
        G_UserData.getTeamCache().setShowEquipTrainFlag(false);
        G_UserData.getTeamCache().setShowTreasureTrainFlag(false);
        G_UserData.getTeamCache().setShowInstrumentTrainFlag(false);
        G_UserData.getTeamCache().setShowHorseTrainFlag(false);
        G_UserData.getTeamCache().setShowAvatarEquipFlag(false);
        G_UserData.getTeamCache().setShowHistoryHeroFlag(false);
        G_AudioManager.unLoadSoundWithId(AudioConst.SOUND_TACTICS_POSITION_UNLOCK);
    }
    updateInfo() {
        this._updateData();
        this._updateView();
    }
    private _updateData() {
        let curPos = G_UserData.getTeam().getCurPos();
        let curHeroId = G_UserData.getTeam().getHeroIdWithPos(curPos);
        G_UserData.getHero().setCurHeroId(curHeroId);
        this._curHeroData = G_UserData.getHero().getUnitDataWithId(curHeroId);
        this._checkInstrumentIsShow();
        this._allYokeData = HeroDataHelper.getHeroYokeInfo(this._curHeroData);
        this._recordBaseAttr();
        G_UserData.getAttr().recordPowerWithKey(FunctionConst.FUNC_TEAM);
        this._recordMasterLevel();
        this.isTacticsShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_TACTICS);
    }
    _onClickButtonPet() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_PET_HOME);
    }
    private _checkInstrumentIsShow() {
        let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_INSTRUMENT)[0];
        let configInfo = this._curHeroData.getConfig();
        let instrumentId = configInfo.instrument_id;
        this._isInstrumentShow = isOpen && instrumentId > 0;
    }
    private _updateView() {
        this._updateBaseInfo();
        this._updateAttr();
        this._updateSkill();
        this._updateTacticsPos();
        this._updateKarma();
        this._updateYoke();
        //this._updateAttrScrollView();
        this._updateEquipment();
        this._updateTreasure();
        this._updateInstrument();
        this._updateHorse();
        this._updateHistoryHero();
        this.checkHeroTrainRP();
        this._updatePower();
        this._formatButtons();
    }
    private _updateBaseInfo() {
        let level = this._curHeroData.getLevel();
        let heroConfig = this._curHeroData.getConfig();
        let rank = this._curHeroData.getRank_lv();
        let maxLevel = G_UserData.getBase().getLevel();
        if (this._curHeroData.isPureGoldHero()) {
            this._nodeLevel.updateUI(Lang.get('goldenhero_train_des'), rank, rank, 4);
            this._nodeLevel.setMaxValue('');
        } else {
            this._nodeLevel.updateUI(Lang.get('team_detail_des_level'), level, maxLevel, 4);
            this._nodeLevel.setMaxValue('/' + maxLevel);
        }
        this._nodePotential.updateUI(Lang.get('team_detail_des_potential'), heroConfig.potential, null, 4);
        this._fileNodeCountry.updateUI(this._curHeroData.getBase_id());
        var limitLevel = this._curHeroData.getLimit_level();
        var limitRedLevel = this._curHeroData.getLimit_rtg();
        this._fileNodeHeroName.setName(this._curHeroData.getBase_id(), rank, limitLevel, null, limitRedLevel,);
        this._fileNodeFeature.setString(heroConfig.feature);
        this._updateAwake();
        this._playCurHeroVoice();
        let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_CHANGE, this._curHeroData);
        this._imageChangeRP.node.active = (reach);
        if (this._curHeroData.isLeader()) {
            this._imageAvatarRP.node.active = (RedPointHelper.isModuleReach(FunctionConst.FUNC_AVATAR));
        }
        let curPos = G_UserData.getTeam().getCurPos();
        if (curPos > 0 && curPos < 7) {
            this._imageSilkbagRP.node.active = (RedPointHelper.isModuleReach(FunctionConst.FUNC_SILKBAG, curPos));
            var historyHeroData = G_UserData.getHistoryHero().getHeroDataWithPos(curPos);
            if (historyHeroData) {
                var reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, 'strongerThanMe', historyHeroData);
                var reach2 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HISTORY_HERO_WAKEN, historyHeroData);
                this._imageHistoryHeroRP.node.active = (reach1 || reach2);
            } else {
                this._imageHistoryHeroRP.node.active = (false);
            }
        }
    }
    private _playCurHeroVoice() {
        let baseId = this._curHeroData.getBase_id();
        G_HeroVoiceManager.playVoiceWithHeroId(baseId);
    }
    //处理按钮位置
    private _formatButtons() {
        let buttons = [
            this._buttonPet,
            this._buttonMaster,
            this._buttonOneKey,
            this._buttonChange,
            this._buttonAvatar,
            this._buttonSilkbag,
            this._buttonHistoryHero
        ];
        let btnCount2Pos = {
            [1]: [cc.v2(305, 67)],
            [2]: [
                cc.v2(248, 67),
                cc.v2(362, 67)
            ],
            [3]: [
                cc.v2(190, 67),
                cc.v2(305, 67),
                cc.v2(420, 67)
            ],
            [4]: [
                cc.v2(134, 67),
                cc.v2(248, 67),
                cc.v2(362, 67),
                cc.v2(476, 67)
            ],
            [5]: [
                cc.v2(105, 67),
                cc.v2(205, 67),
                cc.v2(305, 67),
                cc.v2(405, 67),
                cc.v2(505, 67)
            ],
            [6]: [
                cc.v2(55, 67),
                cc.v2(155, 67),
                cc.v2(255, 67),
                cc.v2(355, 67),
                cc.v2(455, 67),
                cc.v2(555, 67)
            ]
        };
        let isRole = this._curHeroData.isLeader();
        let oneKeyOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_STRENG_ONEKEY)[0];
        let avatarOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_AVATAR)[0];
        let silkbagOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_SILKBAG)[0];
        let showButtons: Array<boolean> = [
            true,
            true,
            oneKeyOpen,
            !isRole,
            isRole && avatarOpen,
            silkbagOpen,
            false
        ];
        let btnCount = 0;
        for (let i = 0; i < showButtons.length; i++) {
            let v = showButtons[i];
            if (v == true) {
                btnCount = btnCount + 1;
            }
        }
        let bgWidth = {
            [1]: 300,
            [2]: 400,
            [3]: 500,
            [4]: 600,
            [5]: 700,
            [6]: 700
        };
        let bgHeight = this._imageBtnBg.node.getContentSize().height;
        this._imageBtnBg.node.setContentSize(cc.size(bgWidth[btnCount], bgHeight));
        let index = 0;
        for (let i = 0; i < buttons.length; i++) {
            let btn = buttons[i];
            if (showButtons[i] == true) {
                btn.node.active = (true);
                btn.node.setPosition(btnCount2Pos[btnCount][index]);
                index = index + 1;
            } else {
                btn.node.active = (false);
            }
        }
    }
    private _updateAttr() {
        this._fileNodeAttr1.updateView(AttributeConst.ATK, this._recordAttr.getCurValue(AttributeConst.ATK), 4);
        this._fileNodeAttr2.updateView(AttributeConst.PD, this._recordAttr.getCurValue(AttributeConst.PD), 4);
        this._fileNodeAttr3.updateView(AttributeConst.HP, this._recordAttr.getCurValue(AttributeConst.HP), 4);
        this._fileNodeAttr4.updateView(AttributeConst.MD, this._recordAttr.getCurValue(AttributeConst.MD), 4);
    }
    private _updateSkill() {
        let skillIds = AvatarDataHelper.getShowSkillIdsByCheck(this._curHeroData);
        for (let i = 1; i <= 3; i++) {
            let skillId = skillIds[i];
            (this['_fileNodeSkill' + i] as CommonSkillIcon).updateUI(skillId, true);
        }
    }
    _updateTacticsPos() {
        this._panelTactics.active = this.isTacticsShow;
        if (!this.isTacticsShow) {
            return;
        }
        var isTacticsPos3Show = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_TACTICS_POS3);
        var pos = G_UserData.getTeam().getCurPos();
        if (!isTacticsPos3Show) {
            var posX = [
                100,
                246
            ];
            for (var i = 1; i <= 2; i++) {
                this['_nodeTactics' + i].x = (posX[i - 1]);
                this['_fileNodeTactics' + i].updateUI(pos, i);
            }
            this['_nodeTactics' + 3].active = (false);
        } else {
            var posX = [
                67,
                173,
                279
            ];
            for (var i = 1; i <= 3; i++) {
                this['_nodeTactics' + i].x = (posX[i - 1]);
                this['_fileNodeTactics' + i].updateUI(pos, i);
            }
            this['_nodeTactics' + 3].active = (true);
        }
        var curPos = G_UserData.getTeam().getCurPos();
        var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TACTICS, 'posRP', curPos);
        this._imageTacticsRedPoint.active = (reach);
    }
    _playTacticsPrompt(tacticsId) {
        var summary = [];
        var param = {
            content: tacticsId == 0 && Lang.get('summary_tactics_unload_success') || Lang.get('summary_tactics_add_success'),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TACTICS }
        };
        table.insert(summary, param);
        G_UserData.getAttr().recordPowerWithKey(FunctionConst.FUNC_TEAM);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    _playTacticsPosPrompt() {
        var summary = [];
        var param = {
            content: Lang.get('summary_tactics_pos_unlock_success'),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TACTICS }
        };
        table.insert(summary, param);
        G_Prompt.showSummary(summary);
    }

    _updateAttrScrollView() {
        var isTacticsOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TACTICS);
        this._panelTactics.active = (isTacticsOpen[0]);
        if (!isTacticsOpen) {
            var offset = this._karamOffset;
            var height = 158 + 566 - offset;
            var contentSize = this._scAttr.getContentSize();
            var size = cc.size(contentSize.width, height);
            this._scAttr.setContentSize(size);
            this._panelBasic.y = (452 - offset);
            this._panelKarma.y = (295 - offset);
            this._nodePanelYoke.y = (this._karamOffset - 30);
        } else {
            var offset = this._karamOffset;
            var height = 158 + 566 - offset;
            var contentSize = this._scAttr.getContentSize();
            var size = cc.size(contentSize.width, height);
            this._scAttr.setContentSize(size);
            this._panelBasic.y = (452 - offset);
            this._panelTactics.y = (323 - offset);
            this._panelKarma.y = (145 - offset);
            this._nodePanelYoke.y = (-25);
        }
    }
    //缘分信息
    private _updateKarma() {
        var imageMark = {
            [AttributeConst.ATK_PER]: [
                'img_com_team_sign02',
                'img_com_team_sign02b'
            ],
            [AttributeConst.DEF_PER]: [
                'img_com_team_sign04',
                'img_com_team_sign04b'
            ],
            [AttributeConst.HP_PER]: [
                'img_com_team_sign03',
                'img_com_team_sign03b'
            ]
        };
        var count = 0;
        var allKaramData = UserDataHelper.getHeroKarmaData(this._curHeroData.getConfig());
        for (var i = 1; i <= HeroConst.HERO_KARMA_MAX; i++) {
            var data = allKaramData[i - 1];
            if (data) {
                var isReach = UserDataHelper.getReachCond(this._curHeroData, data['cond1'], data['cond2']);
                var isActivated = G_UserData.getKarma().isActivated(data.id);
                if (isActivated || isReach) {
                    count = count + 1;
                    var text = this['_textYuanFenDes' + count];
                    var mark = this['_imageYuanFenMark' + count];
                    var bg = this['_imageYuanFenBg' + count];
                    text.node.active = (true);
                    var markInfo = imageMark[data.attrId];
                    // assert(markInfo, string.format('hero_friend config talent_attr is wrong = %d', data.attrId));
                    var markRes = isActivated && markInfo[0] || markInfo[1];
                    var color = isActivated && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
                    text.string = (data.karmaName);
                    text.node.color = (color);
                    mark.node.active = (true);
                    UIHelper.loadTexture(mark, Path.getTeamUI(markRes));
                    bg.node.active = (false);
                }
            }
        }
        if (count < 5) {
            this._imgLine1.node.setContentSize(cc.size(5, 54));
        } else if (count < 7) {
            this._imgLine1.node.setContentSize(cc.size(5, 82));
        } else if (count < 9) {
            this._imgLine1.node.setContentSize(cc.size(5, 110));
        } else {
            this._imgLine1.node.setContentSize(cc.size(5, 128));
        }
        for (var i = count + 1; i <= HeroConst.HERO_KARMA_MAX; i++) {
            this['_textYuanFenDes' + i].node.active = (false);
            this['_imageYuanFenMark' + i].node.active = (false);
            this['_imageYuanFenBg' + i].node.active = (false);
        }
        var LINE_HEIGHT = 30;
        const subHeight = this.isTacticsShow ? 0 : 150;

        var line = Math.ceil(count / 2);
        this._karamOffset = (5 - line) * LINE_HEIGHT;
        this._panelKarma.y = 150 + subHeight;
        this._nodePanelYoke.y = ((4 - line) * LINE_HEIGHT + 15) + subHeight;
        var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_KARMA, this._curHeroData);
        this._imageKarmaRedPoint.node.active = (reach);
        this._imageKarmaTip.node.setPosition(255, 170);
        this._imageKarmaTip.node.active = (reach);
        if (reach) {
            UIActionHelper.playSkewFloatEffect(this._imageKarmaTip.node);
        }
    }

    //羁绊信息
    private _updateYoke() {
        let allYokeData = this._allYokeData;
        if (allYokeData && allYokeData.yokeInfo.length > 0) {
            this._panelYoke.active = (true);
            this._panelNoYoke.active = (false);
            for (let i = 1; i <= 6; i++) {
                this._updateOneYoke(i);
            }
        } else {
            this._panelYoke.active = (false);
            this._panelNoYoke.active = (true);
        }
    }
    //更新一条羁绊
    private _updateOneYoke(index) {
        let allYokeData = this._allYokeData;
        let text = this['_textJiBanDes' + index] as cc.Label;
        let mark = this['_imageJiBanMark' + index];
        if (allYokeData && allYokeData.yokeInfo && allYokeData.yokeInfo[index - 1]) {
            let info = allYokeData.yokeInfo[index - 1];
            text.node.active = (true);
            let color = info.isActivated && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
            text.string = (info.name);
            text.node.color = (color);
            mark.node.active = (info.isActivated);
        } else {
            text.node.active = (false);
            mark.node.active = (false);
        }
    }
    //装备信息
    private _updateEquipment() {
        let curPos = G_UserData.getTeam().getCurPos();
        for (let i = 1; i <= 4; i++) {
            let equipIcon = this['_fileNodeEquip' + i] as TeamEquipIcon;
            equipIcon.updateIcon(curPos, i);
            let param = {
                pos: curPos,
                slot: i
            };
            let reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP, 'slotRP', param);
            let reach2 = false;
            let reach3 = false;
            let equipId = G_UserData.getBattleResource().getResourceId(curPos, 1, i);
            let isLimit = false;
            if (equipId) {
                let equipUnitData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
                reach1 = reach1 || EquipTrainHelper.isNeedRedPointByUnitData(equipUnitData);
                reach1 = reach1 || EquipTrainHelper.needJadeRedPoint(equipId);
                reach2 = reach2 || RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1, 'slotRP', equipUnitData);
                reach3 = reach3 || RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2, 'slotRP', equipUnitData);
            }
            equipIcon.showRedPoint(reach1);
            let reach = reach2 || reach3;
            equipIcon.showUpArrow(reach);
        }
    }
    //宝物信息
    private _updateTreasure() {
        let curPos = G_UserData.getTeam().getCurPos();
        for (let i = 1; i <= 2; i++) {
            let treasureIcon = this['_fileNodeTreasure' + i] as TeamTreasureIcon;
            treasureIcon.updateIcon(curPos, i);
            let param = {
                pos: curPos,
                slot: i
            };
            let reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE, 'slotRP', param);
            treasureIcon.showRedPoint(reach1);
            let reach2 = false;
            let reach3 = false;
            let reach4 = false;
            let reach5 = false;
            let treasureId = G_UserData.getBattleResource().getResourceId(curPos, 2, i);
            if (treasureId) {
                let treasureUnitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
                reach2 = reach2 || RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1, 'slotRP', treasureUnitData);
                reach3 = reach3 || RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2, 'slotRP', treasureUnitData);
                reach4 = reach4 || RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4, 'slotRP', treasureUnitData);
                reach5 = reach5 || TreasureTrainHelper.needJadeRedPoint(treasureUnitData.getId())
            }
            let reach = reach2 || reach3 || reach4 || reach5;
            treasureIcon.showUpArrow(reach);
        }
    }
    //神兵信息
    private _updateInstrument() {
        if (!this._isInstrumentShow) {
            this._instrument.setVisible(true);
            this._instrument.showUnlockView(true);
            return;
        }
        let curPos = G_UserData.getTeam().getCurPos();
        let heroBaseId = this._curHeroData.getBase_id();
        this._instrument.updateIcon(curPos, heroBaseId);
        this._instrument.node.active = (true);
        let param = {
            pos: curPos,
            slot: 1,
            heroBaseId: heroBaseId
        };
        let reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT, 'slotRP', param);
        let reach2 = false;
        let reach3 = false;
        let instrumentId = G_UserData.getBattleResource().getResourceId(curPos, 3, 1);
        if (instrumentId) {
            let instrumentUnitData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
            reach2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1, 'slotRP', instrumentUnitData);
            reach3 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2, 'slotRP', instrumentUnitData);
        }
        this._instrument.showRedPoint(reach1 || reach2 || reach3);
        this._instrument.showTextBg(false);
    }
    //战马信息
    private _updateHorse() {
        let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HORSE)[0];
        if (!isOpen) {
            this._fileNodeHorse.node.active = (false);
            return;
        }
        let curPos = G_UserData.getTeam().getCurPos();
        this._horse.updateIcon(curPos);
        this._fileNodeHorse.node.active = (true);
        let heroBaseId = null;
        let heroId = G_UserData.getTeam().getHeroIdWithPos(curPos);
        if (heroId > 0) {
            let unitData = G_UserData.getHero().getUnitDataWithId(heroId);
            heroBaseId = unitData.getBase_id();
        }
        let param = {
            pos: curPos,
            slot: 1,
            heroBaseId: heroBaseId
        };
        let reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE, 'slotRP', param);
        let reach2 = false;
        let horseId = G_UserData.getBattleResource().getResourceId(curPos, HorseConst.FLAG, 1);
        if (horseId) {
            let horseUnitData = G_UserData.getHorse().getUnitDataWithId(horseId);
            reach2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_TRAIN, 'slotRP', horseUnitData);
        }
        this._horse.showRedPoint(reach1 || reach2);
    }
    _updateHistoryHero() {
        var [isOpen] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO);
        if (!isOpen) {
            this._fileNodeHistoryHero.node.active = (false);
            return;
        }
        var curPos = G_UserData.getTeam().getCurPos();
        this._fileNodeHistoryHero.updateIcon(curPos);
        this._fileNodeHistoryHero.node.active = (true);
        this._recordHistoryHeroStep();
    }
    //战斗力
    private _updatePower() {
        let param = { heroUnitData: this._curHeroData };
        let attrInfo = HeroDataHelper.getHeroPowerAttr(param);
        let power = AttrDataHelper.getPower(attrInfo);
        this._fileNodePower.updateUI(power);
    }
    //觉醒显示
    private _updateAwake() {
        if (HeroGoldHelper.isPureHeroGold(this._curHeroData)) {
            this._imageAwakeBg.node.active = false;
            return;
        }
        let isOpen = HeroTrainHelper.checkIsReachAwakeInitLevel(this._curHeroData);
        let isCanAwake = this._curHeroData.isCanAwake();
        if (isOpen && isCanAwake) {
            this._imageAwakeBg.node.active = (true);
            let awakeLevel = this._curHeroData.getAwaken_level();
            let star = HeroDataHelper.convertAwakeLevel(awakeLevel)[0];
            this._nodeHeroStar.setStarOrMoon(star);
            let show = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE3, this._curHeroData);
            this._imageAwakeRedPoint.node.active = (show);
        } else {
            this._imageAwakeBg.node.active = false;
        }
    }
    //点击大师
    private onButtonMasterClicked() {
        if (!EquipMasterHelper.isOpen(FunctionConst.FUNC_STRENGTHEN_MASTER)) {
            return;
        }
        let curPos = G_UserData.getTeam().getCurPos();
        if (!EquipMasterHelper.isFull(curPos)) {
            return;
        }
        PopupEquipMaster.getIns(PopupEquipMaster, (p: PopupEquipMaster) => {
            p.ctor(curPos);
            p.openWithAction();
        })
    }
    //点击更换
    private onButtonChangeClicked() {
        let curPos = G_UserData.getTeam().getCurPos();
        let isEmpty = PopupChooseHeroHelper.checkIsEmpty(PopupChooseHeroHelper.FROM_TYPE2, [curPos]);
        if (isEmpty) {
            G_Prompt.showTip(Lang.get('hero_popup_list_empty_tip' + PopupChooseHeroHelper.FROM_TYPE2));
        } else {
            UIPopupHelper.popupChooseHero(PopupChooseHeroHelper.FROM_TYPE2, handler(this, this._changeHeroCallBack), curPos, Lang.get("hero_replace_title"));
        }
    }
    //点击一键强化
    private onButtonOneKeyClicked() {
        let curPos = G_UserData.getTeam().getCurPos();
        let ret = EquipDataHelper.getOneKeyStrengCost(curPos);
        let value = ret[0];
        let indexs = ret[1];
        this._oneKeyEquipIndexs = indexs;
        if (value == -1) {
            G_Prompt.showTip(Lang.get('equipment_strengthen_fetch_equip_hint'));
            return;
        }
        if (value == -2) {
            G_Prompt.showTip(Lang.get('equipment_strengthen_all_reach_limit'));
            return;
        }
        if (value == 0) {
            G_Prompt.showTip(Lang.get('common_money_not_enough'));
            return;
        }
        let content = Lang.get('equipment_strengthen_onekey_content', { value: TextHelper.getAmountText1(value) });
        UIPopupHelper.popupSystemAlert(Lang.get('equipment_strengthen_onekey_title'), content, handler(this, this._doOneKeyStreng), null, (p: PopupSystemAlert) => {
            p.setCheckBoxVisible(false);
        });
    }
    //一键强化
    private _doOneKeyStreng() {
        let curPos = G_UserData.getTeam().getCurPos();
        G_UserData.getEquipment().c2sSuperUpgradeEquipment(curPos);
        this._buttonOneKey.interactable = (false);
        this._saveEquipStrMasterInfo();
    }
    //点击觉醒
    private onButtonAwakeClicked() {
        let heroId = this._curHeroData.getId();
        G_SceneManager.showScene('heroTrain', heroId, HeroConst.HERO_TRAIN_AWAKE, HeroConst.HERO_RANGE_TYPE_2, false);
    }
    //点击变身卡
    private onButtonAvatarClicked() {
        let [isOpen, comment] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_AVATAR);
        if (!isOpen) {
            G_Prompt.showTip(comment);
            return;
        }
        G_SceneManager.showScene('avatar', true);
    }
    //点击锦囊
    public onButtonSilkbagClicked() {
        let [isOpen, comment] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_SILKBAG);
        if (!isOpen) {
            G_Prompt.showTip(comment);
            return;
        }
        let curPos = G_UserData.getTeam().getCurPos();
        G_SceneManager.showScene('silkbag', curPos);
    }
    private showHeroDetailView() {
        let curPos = G_UserData.getTeam().getCurPos();
        let heroId = G_UserData.getTeam().getHeroIdWithPos(curPos);
        G_SceneManager.showScene('heroDetail', heroId, HeroConst.HERO_RANGE_TYPE_2);
    }
    public onKarmaClicked() {
        if (this._popupKarma == null) {
            G_SceneManager.openPopup(Path.getPrefab("PopupHeroKarma", "heroTrain"), function (pop: PopupHeroKarma) {
                pop.setInitData(this._curHeroData, HeroConst.HERO_RANGE_TYPE_2);
                this._popupKarma = pop;
                this._popupKarmaSignal = pop.signal.add(handler(this, this._onPopupHeroKaramClose));
                pop.openWithAction();
            }.bind(this))
        }
    }
    private _onPopupHeroKaramClose(event) {
        if (event == 'close') {
            this._popupKarma = null;
            if (this._popupKarmaSignal) {
                this._popupKarmaSignal.remove();
                this._popupKarmaSignal = null;
            }
            let curPos = G_UserData.getTeam().getCurPos();
            if (curPos == null) {
                return;
            }
            this._recordBaseAttr();
            G_UserData.getAttr().recordPowerWithKey(FunctionConst.FUNC_TEAM);
            let summary = [];
            this._addBaseAttrPromptSummary(summary);
            G_Prompt.showSummary(summary);
            G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
        }
    }
    private onYokeClicked() {
        G_SceneManager.openPopup(Path.getPrefab("PopupHeroYoke", "team"), function (popup: PopupHeroYoke) {
            popup.setInitData(this._curHeroData);
            popup.openWithAction();
        }.bind(this));
    }
    private _onAttrClicked() {
        G_SceneManager.openPopup(Path.getPrefab("PopupAttrDetail", "team"), function (popup: PopupAttrDetail) {
            popup.setInitData(this._curHeroData);
            popup.openWithAction();
        }.bind(this));
    }
    //阵容更换成功回调
    private _changeHeroFormation(eventName, pos, oldHeroId) {
        G_UserData.getTeam().setCurPos(pos);
        this._updateData();
        this._updateBaseInfo();
        this._updateSkill();
        this._updateTacticsPos();
        this._updateKarma();
        this._updateYoke();
        //this._updateAttrScrollView();
        this._updateEquipment();
        this._updateTreasure();
        this._updateInstrument();
        this._updateHorse();
        this._updateHistoryHero()
        this.checkHeroTrainRP();
        this._updatePower();
        this._formatButtons();
        this._changeOldHeroId = oldHeroId;
        let isActive = this._curHeroData.isActiveJoint();
        if (isActive) {
            this._popupActiveJoint();
        } else {
            this._playChangeHeroSummary();
        }
    }
    private _heroKarmaActiveSuccess(eventName, destinyId) {
        this._updateKarma();
        //this._updateAttrScrollView();
    }
    private _equipAddSuccess(eventName, oldId, pos, slot) {
        this._updateData();
        this._updateEquipment();
        this._updatePower();
        this._playEquipAddSummary(oldId, pos, slot);
    }
    _onHistoryHeroFormationUpdate() {
        this._updateData();
        this._updateHistoryHero();
        this._updatePower();
        this._playHistoryHeroTrainPrompt();
    }
    _onUserLevelup(eventName) {
        this._updateTacticsPos();
    }
    _onTacticsPosUnlock(eventName, pos, slot) {
        var curPos = G_UserData.getTeam().getCurPos();
        if (pos == curPos) {
            this['_fileNodeTactics' + slot].unlockPosition(handler(this, this._playTacticsPosPrompt));
            G_AudioManager.playSoundWithId(AudioConst.SOUND_TACTICS_POSITION_UNLOCK);
        }
    }
    _onTacticsAddSuccess(eventName, newId, pos, slot) {
        this._updateTacticsPos();
        this._updatePower();
        this._playTacticsPrompt(newId);
    }
    _onTacticsRemoveSuccess(eventName, oldId, pos, slot) {
        this._updateTacticsPos();
        this._updatePower();
        this._playTacticsPrompt(0);
    }
    private _onEventEquipSuperUpgrade(eventName, crits, saveMoney) {
        this._updateData();
        let curPos = G_UserData.getTeam().getCurPos();
        this._playOneKeyEffect(crits, saveMoney, curPos);
    }
    setNeedPopupEquipReplace(showRP) {
        this._needPopupEquipReplace = true;
        this._btnEquipShowRP = showRP;
        this._onEquipEvent();
    }
    setNeedEquipClearPrompt(need) {
        this._needEquipClearPrompt = need;
    }
    private _onEquipEvent() {
        if (this._needPopupEquipReplace) {
            this._popupReplaceEquip();
            this._needPopupEquipReplace = false;
        }
    }
    private _popupReplaceEquip() {
        let curPos = G_UserData.getTeam().getCurPos();
        let curEquipId = G_UserData.getEquipment().getCurEquipId();
        let curEquipUnitData = G_UserData.getEquipment().getEquipmentDataWithId(curEquipId);
        let curEquipSlot = curEquipUnitData.getSlot();
        let [result, noWear, wear] = G_UserData.getEquipment().getReplaceEquipmentListWithSlot(curPos, curEquipSlot);
        if (result.length == 0) {
            G_Prompt.showTip(Lang.get('equipment_empty_tip'));
        } else {
            PopupChooseEquip2.getIns(PopupChooseEquip2, (popup: PopupChooseEquip2) => {
                popup.openWithAction();
                let callBack = handler(this, this._onChooseEquip);
                popup.setTitle(Lang.get('equipment_replace_title'));
                popup.updateUI(PopupChooseEquipHelper.FROM_TYPE2, callBack, result, this._btnEquipShowRP, curEquipUnitData, noWear, curPos);
            })
        }
    }
    private _onChooseEquip(equipId) {
        let curPos = G_UserData.getTeam().getCurPos();
        let curEquipId = G_UserData.getEquipment().getCurEquipId();
        let curEquipUnitData = G_UserData.getEquipment().getEquipmentDataWithId(curEquipId);
        let curEquipSlot = curEquipUnitData.getSlot();
        G_UserData.getEquipment().c2sAddFightEquipment(curPos, curEquipSlot, equipId);
    }
    private _treasureAddSuccess(eventName, oldId, pos, slot) {
        this._updateData();
        this._updateTreasure();
        this._updatePower();
        this._playTreasureAddSummary(oldId, pos, slot);
    }
    setNeedPopupTreasureReplace(showRP) {
        this._needPopupTreasureReplace = true;
        this._btnTreasureShowRP = showRP;
        this._onTreasureEvent();
    }
    setNeedTreasureRemovePrompt(need) {
        this._needTreasureRemovePrompt = need;
    }
    private _onTreasureEvent() {
        if (this._needPopupTreasureReplace) {
            this._popupReplaceTreasure();
            this._needPopupTreasureReplace = false;
        }
    }
    private _popupReplaceTreasure() {
        let curPos = G_UserData.getTeam().getCurPos();
        let curTreasureId = G_UserData.getTreasure().getCurTreasureId();
        let curTreasureUnitData = G_UserData.getTreasure().getTreasureDataWithId(curTreasureId);
        let curTreasureSlot = curTreasureUnitData.getSlot();
        let [result, noWear, wear] = G_UserData.getTreasure().getReplaceTreasureListWithSlot(curPos, curTreasureSlot);
        if (result.length == 0) {
            G_Prompt.showTip(Lang.get('treasure_empty_tip'));
        } else {
            PopupChooseTreasure2.loadCommonPrefab("PopupChooseTreasure2", (popup: PopupChooseTreasure2) => {
                let callBack = handler(this, this._onChooseTreasure);
                popup.setTitle(Lang.get('treasure_replace_title'));
                popup.updateUI(PopupChooseTreasureHelper.FROM_TYPE2, callBack, result, this._btnTreasureShowRP, curTreasureUnitData, noWear, curPos);
                popup.openWithAction();
            })
        }
    }
    private _onChooseTreasure(treasureId) {
        let curPos = G_UserData.getTeam().getCurPos();
        let curTreasureId = G_UserData.getTreasure().getCurTreasureId();
        let curTreasureUnitData = G_UserData.getTreasure().getTreasureDataWithId(curTreasureId);
        let curTreasureSlot = curTreasureUnitData.getSlot();
        G_UserData.getTreasure().c2sEquipTreasure(curPos, curTreasureSlot, treasureId);
    }
    private _instrumentAddSuccess(eventName, id, pos, oldId) {
        this._updateData();
        this._updateInstrument();
        this._updatePower();
        this._playInstrumentAddSummary(id, pos, oldId);
    }
    private _horseAddSuccess(eventName, id, pos, oldId) {
        this._updateData();
        this._updateHorse();
        this._updatePower();
        this._playHorseAddSummary(id, pos, oldId);
    }
    private _horseRemoveSuccess(eventName) {
        this._updateData();
        this._updateHorse();
        this._updatePower();
    }
    setNeedPopupInstrumentReplace(showRP) {
        this._needPopupInstrumentReplace = true;
        this._btnInstrumentShowRP = showRP;
        this._onInstrumentEvent();
    }
    setNeedInstrumentRemovePrompt(need) {
        this._needInstrumentRemovePrompt = need;
    }
    private _onInstrumentEvent() {
        if (this._needPopupInstrumentReplace) {
            this._popupReplaceInstrument();
            this._needPopupInstrumentReplace = false;
        }
    }
    private _popupReplaceInstrument() {
        let curPos = G_UserData.getTeam().getCurPos();
        let heroBaseId = this._curHeroData.getBase_id();
        var instrumentId = G_UserData.getInstrument().getCurInstrumentId();
        var curInstrumentData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
        let params = G_UserData.getInstrument().getReplaceInstrumentListWithSlot(curPos, heroBaseId);
        let result = params[0];
        if (result.length == 0) {
            G_Prompt.showTip(Lang.get('instrument_empty_tip'));
        } else {
            let callBack = handler(this, this._onChooseInstrument);
            let instrumentShowRP = this._btnInstrumentShowRP;
            UIPopupHelper.popupChooseInstrument(function (popup: PopupChooseInstrument) {
                popup.openWithAction();
                popup.setTitle(Lang.get('instrument_replace_title'));
                popup.updateUI(PopupChooseInstrumentHelper.FROM_TYPE2, callBack, result, instrumentShowRP, curInstrumentData);

            });

        }
    }
    private _onChooseInstrument(instrumentId) {
        let curPos = G_UserData.getTeam().getCurPos();
        G_UserData.getInstrument().c2sAddFightInstrument(curPos, instrumentId);
    }
    setNeedPopupHorseReplace(showRP) {
        this._needPopupHorseReplace = true;
        this._btnHorseShowRP = showRP;
        this._onHorseEvent();
    }
    setNeedHorseRemovePrompt(need) {
        this._needHorseRemovePrompt = need;
    }
    private _onHorseEvent() {
        if (this._needPopupHorseReplace) {
            this._popupReplaceHorse();
            this._needPopupHorseReplace = false;
        }
    }
    private _popupReplaceHorse() {
        let curPos = G_UserData.getTeam().getCurPos();
        let heroId = G_UserData.getTeam().getHeroIdWithPos(curPos);
        let heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        let heroBaseId = heroUnitData.getAvatarToHeroBaseId();
        let result = G_UserData.getHorse().getReplaceHorseListWithSlot(curPos, heroBaseId)[0];
        if (result.length == 0) {
            G_Prompt.showTip(Lang.get('horse_empty_tip'));
        } else {
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupChooseHorse"), function (popup: PopupChooseHorse) {
                let callBack = handler(this, this._onChooseHorse);
                popup.setTitle(Lang.get('horse_replace_title'));
                popup.updateUI(PopupChooseHorseHelper.FROM_TYPE2, callBack, result, this._btnHorseShowRP);
                popup.openWithAction();
            }.bind(this))
        }
    }
    private _onChooseHorse(horseId) {
        let curPos = G_UserData.getTeam().getCurPos();
        G_UserData.getHorse().c2sWarHorseFit(curPos, horseId);
    }
    private _changeHeroCallBack(heroId, param) {
        let pos = unpack(param)[0];
        G_UserData.getTeam().c2sChangeHeroFormation(pos, heroId);
    }
    private _popupActiveJoint() {
        G_SceneManager.openPopup(Path.getPrefab("PopupActiveJoint", "team"), function (popup: PopupActiveJoint) {
            popup.setInitData(this._curHeroData, this)
            popup.open();
        }.bind(this));
    }
    onExitPopupActiveJoint() {
        this._playChangeHeroSummary();
    }
    checkHeroTrainRP() {
        let curPos = G_UserData.getTeam().getCurPos();
        let curHeroId = G_UserData.getTeam().getHeroIdWithPos(curPos);
        let data = G_UserData.getHero().getUnitDataWithId(curHeroId);
        this._parentView.checkHeroTrainRP(data);
    }
    private _recordBaseAttr() {
        let param = { heroUnitData: this._curHeroData };
        let attrInfo = HeroDataHelper.getTotalAttr(param);
        let curPos = G_UserData.getTeam().getCurPos();
        this._recordAttr.updateData(attrInfo);
    }
    private _playChangeHeroSummary() {
        let summary = [];
        let successStr = '';
        if (this._changeOldHeroId && this._changeOldHeroId > 0) {
            successStr = Lang.get('summary_hero_change');
        } else {
            let curPos = G_UserData.getTeam().getCurPos();
            this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst['FUNC_TEAM_SLOT' + curPos]);
            this._recordAttr.updateData({ [AttributeConst.HIT]: 1000 });
            this._recordBaseAttr();
            successStr = Lang.get('summary_hero_inbattle');
        }
        let param2 = {
            content: successStr,
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
            finishCallback: function () {
                if (this._onChangeHeroSummaryFinish) {
                    this._onChangeHeroSummaryFinish();
                }
            }.bind(this)
        };
        summary.push(param2);
        let isActive = this._curHeroData.isActiveJoint();
        if (isActive) {
            let heroConfig = this._curHeroData.getConfig();
            let baseId = this._curHeroData.getBase_id();
            let jointType = heroConfig.skill_3_type;
            let jointHeroId = heroConfig.skill_3_partner;
            let heroId1 = jointType == 1 && baseId || jointHeroId;
            let limitLevel = this._curHeroData.getLimit_level();
            var limitRedLevel = this._curHeroData.getLimit_rtg();
            var heroRankConfig = HeroDataHelper.getHeroRankConfig(heroId1, 0, limitLevel, limitRedLevel);
            if (heroRankConfig == null) {
                heroRankConfig = HeroDataHelper.getHeroRankConfig(heroId1, 0, 0, 0);
            }
            let skillId = heroRankConfig.rank_skill_3;
            if (skillId > 0) {
                let skillActiveConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE).get(skillId);
                //assert((skillActiveConfig, cc.js.formatStr('hero_skill_active config can not find id = %d', skillId));
                let name = skillActiveConfig.name;
                let param3 = {
                    content: Lang.get('summary_joint_active', { name: name }),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM }
                };
                summary.push(param3);
            }
        }
        function getYokeIndex(fateId) {
            let allYokeData = this._allYokeData;
            if (allYokeData && allYokeData.yokeInfo) {
                for (let i = 1; i <= 6; i++) {
                    let info = allYokeData.yokeInfo[i];
                    if (info && info.id == fateId) {
                        return i;
                    }
                }
            }
            return null;
        }
        let heroBaseId = this._curHeroData.getBase_id();
        let ret = HeroDataHelper.getWillActivateYokeCount(heroBaseId);
        let count = ret[0];
        let info = ret[1];
        let myYokeIndex = null;
        for (let i in info) {
            let one = info[i];
            let heroParam = one.heroParam;
            let content = Lang.get('summary_yoke_active', {
                heroName: heroParam.name,
                colorHero: Colors.colorToNumber(heroParam.icon_color),
                outlineHero: Colors.colorToNumber(heroParam.icon_color_outline),
                yokeName: one.yokeName
            });
            let dstPosition = null;
            let finishCallback = null;
            let index = getYokeIndex(one.fateId);
            if (index) {
                myYokeIndex = index;
                dstPosition = UIHelper.convertSpaceFromNodeToNode(this['_textJiBanDes' + index].node, this.node);
                finishCallback = function () {
                    this._updateOneYoke(index);
                };
            }
            let param = {
                content: content,
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
                dstPosition: dstPosition,
                finishCallback: finishCallback
            };
            summary.push(param);
        }
        let allYokeData = this._allYokeData;
        if (allYokeData && allYokeData.yokeInfo) {
            for (let j = 1; j <= 6; j++) {
                if (j != myYokeIndex) {
                    this._updateOneYoke(j);
                }
            }
        } else {
            this._updateYoke();
        }
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _addBaseAttrPromptSummary(summary: Array<any>, pos?) {
        let curPos = pos || G_UserData.getTeam().getCurPos();
        let _this = this;
        for (let i in RECORD_ATTR_LIST) {
            let one = RECORD_ATTR_LIST[i];
            let attrId = one[0];
            let dstNodeName = one[1];
            let diffValue = this._recordAttr.getDiffValue(attrId);
            if (diffValue != 0) {
                let param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: new cc.Vec2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM + UIConst.SUMMARY_OFFSET_X_ATTR },
                    dstPosition: dstNodeName && UIHelper.convertSpaceFromNodeToNode(this[dstNodeName].node, this.node) || null,
                    finishCallback() {
                        if (attrId && dstNodeName) {
                            let curValue = _this._recordAttr.getCurValue(attrId);
                            (_this[dstNodeName].node.getChildByName('TextValue').getComponent(cc.Label) as cc.Label).string = (curValue);
                        }
                    }
                };
                summary.push(param);
            }
        }
        return summary;
    }
    private _playRemoveTreasureSummary() {
        this._updateYoke();
        this._updateTreasure();
        this._updatePower();
        let summary = [];
        G_Prompt.showSummary(this._addBaseAttrPromptSummary(summary));
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _playTreasureAddSummary(oldId, pos, slot) {

        let _this = this;
        let summary = [];
        let param1 = {
            content: oldId > 0 && Lang.get('summary_treasure_change_success') || Lang.get('summary_treasure_add_success'),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
            finishCallback: function () {
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'TeamView:_playTreasureAddSummary');
            }
        };
        summary.push(param1);
        let isInYokeCondition = function (ids, id) {
            for (let i in ids) {
                let v = ids[i];
                if (v == id) {
                    return true;
                }
            }
            return false;
        }
        let treasureId = G_UserData.getBattleResource().getResourceId(pos, 2, slot);
        let treasureData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
        let treasureBaseId = treasureData.getBase_id();
        let allYokeData = this._allYokeData;
        if (allYokeData && allYokeData.yokeInfo) {
            for (let i = 1; i <= 6; i++) {
                let info = allYokeData.yokeInfo[i - 1];
                if (info && info.isActivated && info.fateType == 3 && isInYokeCondition(info.heroIds, treasureBaseId)) {
                    let heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, this._curHeroData.getBase_id());
                    let heroName = heroParam.name;
                    let param = {
                        content: Lang.get('summary_yoke_active', {
                            heroName: heroName,
                            colorHero: Colors.colorToNumber(heroParam.icon_color),
                            outlineHero: Colors.colorToNumber(heroParam.icon_color_outline),
                            yokeName: info.name
                        }),
                        startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
                        dstPosition: UIHelper.convertSpaceFromNodeToNode(this['_textJiBanDes' + i].node, this.node),
                        finishCallback: function () {
                            _this._updateOneYoke(i);
                        }.bind(this)
                    };
                    summary.push(param);
                } else {
                    this._updateOneYoke(i);
                }
            }
        }
        this._addTreasureStrMasterPromptSummary(summary, pos);
        this._addTreasureRefinePromptSummary(summary, pos);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _playRemoveInstrumentSummary() {
        this._updateYoke();
        this._updateInstrument();
        this._updatePower();
        let summary = [];
        G_Prompt.showSummary(this._addBaseAttrPromptSummary(summary));
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _playRemoveHorseSummary() {
        this._updateHorse();
        this._updatePower();
        let summary = [];
        G_Prompt.showSummary(this._addBaseAttrPromptSummary(summary));
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _playInstrumentAddSummary(id, pos, oldId) {
        let _this = this;
        let summary = [];
        let param1 = {
            content: oldId > 0 && Lang.get('summary_instrument_change_success') || Lang.get('summary_instrument_add_success'),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM }
        };
        summary.push(param1);
        let isInYokeCondition = function (ids, id) {
            for (let i in ids) {
                let v = ids[i];
                if (v == id) {
                    return true;
                }
            }
            return false;
        }
        let instrumentId = G_UserData.getBattleResource().getResourceId(pos, 3, 1);
        let instrumentData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
        let instrumentBaseId = instrumentData.getBase_id();
        let allYokeData = this._allYokeData;
        let posFunc: number = 0;
        if (allYokeData && allYokeData.yokeInfo) {
            for (let i = 1; i <= 6; i++) {
                let info = allYokeData.yokeInfo[i];
                if (info && info.isActivated && info.fateType == 4 && isInYokeCondition(info.heroIds, instrumentBaseId)) {
                    let heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, this._curHeroData.getBase_id());
                    let heroName = heroParam.name;
                    let p = i;
                    let param = {
                        content: Lang.get('summary_yoke_active', {
                            heroName: heroName,
                            colorHero: Colors.colorToNumber(heroParam.icon_color),
                            outlineHero: Colors.colorToNumber(heroParam.icon_color_outline),
                            yokeName: info.name
                        }),
                        startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
                        dstPosition: UIHelper.convertSpaceFromNodeToNode(this['_textJiBanDes' + i].node, this.node),
                        finishCallback() {
                            posFunc++;
                            _this._updateOneYoke(posFunc);
                        }
                    };
                    summary.push(param);
                } else {
                    this._updateOneYoke(i);
                }
            }
        }
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _playHorseAddSummary(id, pos, oldId) {
        let summary = [];
        let param1 = {
            content: oldId > 0 && Lang.get('summary_horse_change_success') || Lang.get('summary_horse_add_success'),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM }
        };
        summary.push(param1);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _playRemoveEquipSummary() {
        this._updateYoke();
        this._updateEquipment();
        this._updatePower();
        let summary = [];
        G_Prompt.showSummary(this._addBaseAttrPromptSummary(summary));
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _playEquipAddSummary(oldId, pos, slot) {
        let _this = this;
        let summary = [];
        let param1 = {
            content: oldId > 0 && Lang.get('summary_equip_change_success') || Lang.get('summary_equip_add_success'),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
            finishCallback: function () {
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'TeamView:_playEquipAddSummary');
            }
        };
        summary.push(param1);
        let isInYokeCondition = function (ids, id) {
            for (let i in ids) {
                let v = ids[i];
                if (v == id) {
                    return true;
                }
            }
            return false;
        }
        let equipId = G_UserData.getBattleResource().getResourceId(pos, 1, slot);
        let equipData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
        let equipBaseId = equipData.getBase_id();
        let allYokeData = this._allYokeData;
        if (allYokeData && allYokeData.yokeInfo) {
            for (let i = 1; i <= 6; i++) {
                let info = allYokeData.yokeInfo[i];
                if (info && info.isActivated && info.fateType == 2 && isInYokeCondition(info.heroIds, equipBaseId)) {
                    let heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, this._curHeroData.getBase_id());
                    let heroName = heroParam.name;
                    let param = {
                        content: Lang.get('summary_yoke_active', {
                            heroName: heroName,
                            colorHero: Colors.colorToNumber(heroParam.icon_color),
                            outlineHero: Colors.colorToNumber(heroParam.icon_color_outline),
                            yokeName: info.name
                        }),
                        startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
                        dstPosition: UIHelper.convertSpaceFromNodeToNode(this['_textJiBanDes' + i].node, this.node),
                        finishCallback: function () {
                            _this._updateOneYoke(i);
                        }
                    };
                    summary.push(param);
                } else {
                    this._updateOneYoke(i);
                }
            }
        }
        this._addEquipStrMasterPromptSummary(summary, pos);
        this._addEquipRefineMasterPromptSummary(summary, pos);
        this._addEquipSuitPromptSummary(summary, pos, slot);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _playEquipSuperUpgradeSummary(crits, saveMoney, pos) {
        let summary = [];
        let param1 = {
            content: Lang.get('summary_equip_str_success_tip6'),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
            finishCallback: function () {
                if (this._diffEquipStrMasterLevel > 0) {
                    let curPos = G_UserData.getTeam().getCurPos();
                    let curMasterInfo = EquipMasterHelper.getCurMasterInfo(curPos, MasterConst.MASTER_TYPE_1);
                    G_SceneManager.openPopup(Path.getPrefab("PopupMasterLevelup", "equipment"), function (popup: PopupMasterLevelup) {
                        popup.ctor(this, this._lastEquipStrMasterInfo, curMasterInfo, MasterConst.MASTER_TYPE_1);
                        popup.openWithAction();
                    }.bind(this))
                }
            }.bind(this)
        };
        summary.push(param1);
        let critsInfo = {};
        for (let i in crits) {
            let value = crits[i];
            if (value > 1) {
                if (critsInfo[value] == null) {
                    critsInfo[value] = 0;
                }
                critsInfo[value] = critsInfo[value] + 1;
            }
        }
        let key2Text = {
            1: '一',
            2: '两',
            3: '三',
            4: '四',
            5: '五',
            6: '六'
        };
        for (let k in critsInfo) {
            let v = critsInfo[k];
            let param2 = {
                content: Lang.get('summary_equip_str_success_tip2', {
                    multiple: key2Text[k],
                    count: v
                }),
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM }
            };
            summary.push(param2);
        }
        if (saveMoney > 0) {
            let param3 = {
                content: Lang.get('summary_equip_str_success_tip5', { value: saveMoney }),
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM }
            };
            summary.push(param3);
        }
        this._addBaseAttrPromptSummary(summary, pos);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _addEquipStrMasterPromptSummary(summary, pos) {
        let _this = this;
        let curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_1);
        let curLevel = curMasterInfo.masterInfo.curMasterLevel;
        let info = this._lastEquipStrMasterLevel;
        if (info[1] && info[1] == pos && this._diffEquipStrMasterLevel > 0) {
            let param = {
                content: Lang.get('summary_equip_str_master_reach', { level: info[2] }),
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
                dstPosition: UIHelper.convertSpaceFromNodeToNode(this._buttonMaster.node, this.node),
                finishCallback: function () {
                    UIActionHelper.playScaleUpEffect(_this._buttonMaster.node);
                }
            };
            summary.push(param);
        }
    }
    private _addEquipRefineMasterPromptSummary(summary: Array<any>, pos) {
        let _this = this;
        let curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_2);
        let curLevel = curMasterInfo.masterInfo.curMasterLevel;
        let info = this._lastEquipRefineMasterLevel;
        if (info[1] && info[1] == pos && this._diffEquipRefineMasterLevel > 0) {
            let param = {
                content: Lang.get('summary_equip_refine_master_reach', { level: info[2] }),
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
                dstPosition: UIHelper.convertSpaceFromNodeToNode(this._buttonMaster.node, this.node),
                finishCallback() {
                    UIActionHelper.playScaleUpEffect(_this._buttonMaster.node);
                }
            };
            summary.push(param);
        }
    }
    private _addTreasureStrMasterPromptSummary(summary: Array<any>, pos) {
        let _this = this;
        let curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_3);
        let curLevel = curMasterInfo.masterInfo.curMasterLevel;
        let info = this._lastTreasureStrMasterLevel;
        if (info[1] && info[1] == pos && this._diffTreasureStrMasterLevel > 0) {
            let param = {
                content: Lang.get('summary_treasure_str_master_reach', { level: info[2] }),
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
                dstPosition: UIHelper.convertSpaceFromNodeToNode(this._buttonMaster.node, this.node),
                finishCallback() {
                    UIActionHelper.playScaleUpEffect(_this._buttonMaster.node);
                }
            };
            summary.push(param);
        }
    }
    private _addTreasureRefinePromptSummary(summary: Array<any>, pos) {
        let _this = this;
        let curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_4);
        let curLevel = curMasterInfo.masterInfo.curMasterLevel;
        let info = this._lastTreasureRefineMasterLevel;
        if (info[1] && info[1] == pos && this._diffTreasureRefineMasterLevel > 0) {
            let param = {
                content: Lang.get('summary_treasure_refine_master_reach', { level: info[2] }),
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
                dstPosition: UIHelper.convertSpaceFromNodeToNode(this._buttonMaster.node, this.node),
                finishCallback() {
                    UIActionHelper.playScaleUpEffect(_this._buttonMaster.node);
                }
            };
            summary.push(param);
        }
    }
    private _addEquipSuitPromptSummary(summary: Array<any>, pos, slot) {
        let equipId = G_UserData.getBattleResource().getResourceId(pos, 1, slot);
        let equipData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
        let suitId = equipData.getConfig().suit_id;
        if (suitId > 0) {
            let componentCount = 0;
            let activeCount = 0;
            let componentIds = EquipDataHelper.getSuitComponentIds(suitId);
            for (let i in componentIds) {
                let id = componentIds[i];
                let isHave = TeamDataHelper.isHaveEquipInPos(id, pos);
                if (isHave) {
                    componentCount = componentCount + 1;
                }
            }
            let attrInfo = EquipDataHelper.getSuitAttrShowInfo(suitId);
            for (let i in attrInfo) {
                let one = attrInfo[i];
                let count = one.count;
                if (componentCount >= count) {
                    activeCount = count;
                }
            }
            if (activeCount > 0) {
                let name = EquipDataHelper.getSuitName(suitId);
                let param = {
                    content: Lang.get('summary_equip_suit_active', {
                        name: name,
                        count: activeCount
                    }),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM }
                };
                summary.push(param);
            }
        }
    }
    private _onChangeHeroSummaryFinish() {
        this.node.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "TeamHeroNode");
        })));
    }
    private _checkHeroTrainPrompt() {
        let flag = G_UserData.getTeamCache().isShowHeroTrainFlag();
        if (!flag) {
            return false;
        }
        let curId = this._curHeroData.getId();
        let lastId = this._lastHeroLevel[1] || 0;
        let lastLevel = this._lastHeroLevel[2] || 0;
        let nowLevel = this._curHeroData.getLevel();
        let heroType = this._curHeroData.getConfig().type;
        if (lastId == curId && nowLevel > lastLevel && lastLevel > 0 && heroType != 1) {
            return true;
        }
        let lastRank = this._lastHeroRank[2] || -1;
        let nowRank = this._curHeroData.getRank_lv();
        if (lastId == curId && nowRank > lastRank && lastRank > -1) {
            return true;
        }
        let lastAwake = this._lastHeroAwake[2] || -1;
        let nowAwake = this._curHeroData.getAwaken_level();
        if (lastId == curId && nowAwake > lastAwake && lastAwake > -1) {
            return true;
        }
        let lastLimit = this._lastHeroLimit[2] || -1;
        let nowLimit = this._curHeroData.getLimit_level();
        if (lastId == curId && nowLimit > lastLimit && lastLimit > -1) {
            return true;
        }
        return false;
    }
    private _playHeroTrainPrompt() {
        this._updateAwake();
        this._updateSkill();
        this.checkHeroTrainRP();
        this._updatePower();
        let _this = this;
        let summary = [];
        let lastLevel = this._lastHeroLevel[2];
        let nowLevel = this._curHeroData.getLevel();
        let textLevel = this._nodeLevel._textValue;
        let finishCallback1 = function () {
            if (this._nodeLevel) {
                textLevel.string = (this._curHeroData.getLevel());
                this._updateBaseInfo();
            }
        }
        let dstPosition = UIHelper.convertSpaceFromNodeToNode(textLevel.node, this.node);
        TeamViewHelper.makeLevelDiffData(summary, this._curHeroData, lastLevel, dstPosition, finishCallback1);

        let finishCallback2 = function () {
            if (_this._nodeLevel) {
                _this._updateBaseInfo();
            }
        }
        let lastRank = this._lastHeroRank[2];
        TeamViewHelper.makeBreakDiffData(summary, this._curHeroData, lastRank, finishCallback2);


        let lastAwake = this._lastHeroAwake[2];
        TeamViewHelper.makeAwakeDiffData(summary, this._curHeroData, lastAwake);


        let finishCallback3 = function () {
            if (_this._nodeLevel) {
                _this._updateBaseInfo();
            }
        }
        let lastLimit = this._lastHeroLimit[2];
        TeamViewHelper.makeLimitDiffData(summary, this._curHeroData, lastLimit, finishCallback3);

        console.log(summary);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _saveEquipStrMasterInfo() {
        let pos = G_UserData.getTeam().getCurPos();
        this._lastEquipStrMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_1);
    }
    private _recordMasterLevel() {
        let pos = G_UserData.getTeam().getCurPos();
        let info1 = this._lastEquipStrMasterLevel;
        let lastLevel1 = info1[2] || 0;
        let curMasterInfo1 = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_1);
        let curLevel1 = curMasterInfo1.masterInfo.curMasterLevel;
        this._diffEquipStrMasterLevel = curLevel1 - lastLevel1;
        this._lastEquipStrMasterLevel = {
            '1': pos,
            '2': curLevel1
        };
        let info2 = this._lastEquipRefineMasterLevel;
        let lastLevel2 = info2[2] || 0;
        let curMasterInfo2 = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_2);
        let curLevel2 = curMasterInfo2.masterInfo.curMasterLevel;
        this._diffEquipRefineMasterLevel = curLevel2 - lastLevel2;
        this._lastEquipRefineMasterLevel = {
            '1': pos,
            '2': curLevel2
        };
        let info3 = this._lastTreasureStrMasterLevel;
        let lastLevel3 = info3[2] || 0;
        let curMasterInfo3 = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_3);
        let curLevel3 = curMasterInfo3.masterInfo.curMasterLevel;
        this._diffTreasureStrMasterLevel = curLevel3 - lastLevel3;
        this._lastTreasureStrMasterLevel = {
            '1': pos,
            '2': curLevel3
        };
        let info4 = this._lastTreasureRefineMasterLevel;
        let lastLevel4 = info4[2] || 0;
        let curMasterInfo4 = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_4);
        let curLevel4 = curMasterInfo4.masterInfo.curMasterLevel;
        this._diffTreasureRefineMasterLevel = curLevel4 - lastLevel4;
        this._lastTreasureRefineMasterLevel = {
            '1': pos,
            '2': curLevel4
        };
    }
    private _recordEquipLevel() {
        let info1 = {};
        let info2 = {};
        let pos = G_UserData.getTeam().getCurPos();
        for (let i = 1; i <= 4; i++) {
            let equipId = G_UserData.getBattleResource().getResourceId(pos, 1, i);
            if (equipId) {
                let equipData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
                let equipLevel = equipData.getLevel();
                let equipRLevel = equipData.getR_level();
                info1[i] = [
                    equipId,
                    equipLevel
                ];
                info2[i] = [
                    equipId,
                    equipRLevel
                ];
            }
        }
        this._lastEquipLevel = info1;
        this._lastEquipRLevel = info2;
    }
    private _recordTreasureLevel() {
        let info1 = {};
        let info2 = {};
        let pos = G_UserData.getTeam().getCurPos();
        for (let i = 1; i <= 4; i++) {
            let treasureId = G_UserData.getBattleResource().getResourceId(pos, 2, i);
            if (treasureId) {
                let treasureData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
                let treasureLevel = treasureData.getLevel();
                let treasureRLevel = treasureData.getRefine_level();
                info1[i] = [
                    treasureId,
                    treasureLevel
                ];
                info2[i] = [
                    treasureId,
                    treasureRLevel
                ];
            }
        }
        this._lastTreasureLevel = info1;
        this._lastTreasureRLevel = info2;
    }
    private _recordInstrumentLevel() {
        let info1 = {};
        let pos = G_UserData.getTeam().getCurPos();
        for (let i = 1; i <= 1; i++) {
            let instrumentId = G_UserData.getBattleResource().getResourceId(pos, 3, i);
            if (instrumentId) {
                let instrumentData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
                let instrumentLevel = instrumentData.getLevel();
                info1[i] = [
                    instrumentId,
                    instrumentLevel
                ];
            }
        }
        this._lastInstrumentLevel = info1;
    }
    private _recordHorseStar() {
        let info1 = {};
        let pos = G_UserData.getTeam().getCurPos();
        for (let i = 1; i <= 1; i++) {
            let horseId = G_UserData.getBattleResource().getResourceId(pos, HorseConst.FLAG, i);
            if (horseId) {
                let horseData = G_UserData.getHorse().getUnitDataWithId(horseId);
                let star = horseData.getStar();
                info1[i] = [
                    horseId,
                    star
                ];
            }
        }
        this._lastHorseLevel = info1;
    }

    _recordHistoryHeroStep() {
        var info1 = {};
        var pos = G_UserData.getTeam().getCurPos();
        var historyHeroIds = G_UserData.getHistoryHero().getHistoryHeroIds();
        var historyHeroId = historyHeroIds[pos -1];
        if (historyHeroId && historyHeroId > 0) {
            var historyHeroData = G_UserData.getHistoryHero().getHisoricalHeroValueById(historyHeroId);
            var step = historyHeroData.getBreak_through();
            info1[pos] = [
                historyHeroId,
                step
            ];
        }
        this._lastHistoryHeroLevel = info1;
    }
    private _checkEquipTrainPrompt() {
        let flag = G_UserData.getTeamCache().isShowEquipTrainFlag();
        if (!flag) {
            return false;
        }
        let pos = G_UserData.getTeam().getCurPos();
        let lastInfo1 = this._lastEquipLevel;
        let lastInfo2 = this._lastEquipRLevel;
        for (let i = 1; i <= 4; i++) {
            let equipId = G_UserData.getBattleResource().getResourceId(pos, 1, i);
            if (equipId) {
                let info1 = lastInfo1[i];
                let info2 = lastInfo2[i];
                if (info1) {
                    let lastId = info1[1] || 0;
                    let lastLevel = info1[2] || 0;
                    let equipData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
                    let equipLevel = equipData.getLevel();
                    if (equipId == lastId && equipLevel > lastLevel) {
                        return true;
                    }
                }
                if (info2) {
                    let lastId = info2[1] || 0;
                    let lastRLevel = info2[2] || 0;
                    let equipData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
                    let equipRLevel = equipData.getR_level();
                    if (equipId == lastId && equipRLevel > lastRLevel) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    private _playEquipTrainPrompt() {
        this._updateEquipment();
        this.checkHeroTrainRP();
        this._updatePower();
        let pos = G_UserData.getTeam().getCurPos();
        let summary = [];
        this._addEquipStrMasterPromptSummary(summary, pos);
        this._addEquipRefineMasterPromptSummary(summary, pos);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _checkTreasureTrainPrompt() {
        let flag = G_UserData.getTeamCache().isShowTreasureTrainFlag();
        if (!flag) {
            return false;
        }
        let pos = G_UserData.getTeam().getCurPos();
        let lastInfo1 = this._lastTreasureLevel;
        let lastInfo2 = this._lastTreasureRLevel;
        for (let i = 1; i <= 2; i++) {
            let treasureId = G_UserData.getBattleResource().getResourceId(pos, 2, i);
            if (treasureId) {
                let info1 = lastInfo1[i];
                let info2 = lastInfo2[i];
                if (info1) {
                    let lastId = info1[1] || 0;
                    let lastLevel = info1[2] || 0;
                    let treasureData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
                    let treasureLevel = treasureData.getLevel();
                    if (treasureId == lastId && treasureLevel > lastLevel) {
                        return true;
                    }
                }
                if (info2) {
                    let lastId = info2[1] || 0;
                    let lastRLevel = info2[2] || 0;
                    let treasureData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
                    let treasureRLevel = treasureData.getRefine_level();
                    if (treasureId == lastId && treasureRLevel > lastRLevel) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    private _playTreasureTrainPrompt() {
        this._updateTreasure();
        this.checkHeroTrainRP();
        this._updatePower();
        let pos = G_UserData.getTeam().getCurPos();
        let summary = [];
        this._addTreasureStrMasterPromptSummary(summary, pos);
        this._addTreasureRefinePromptSummary(summary, pos);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _checkInstrumentTrainPrompt(): boolean {
        let flag = G_UserData.getTeamCache().isShowInstrumentTrainFlag();
        if (!flag) {
            return false;
        }
        let pos = G_UserData.getTeam().getCurPos();
        let lastInfo1 = this._lastInstrumentLevel;
        for (let i = 1; i <= 1; i++) {
            let instrumentId = G_UserData.getBattleResource().getResourceId(pos, 3, i);
            if (instrumentId) {
                let info1 = lastInfo1[i];
                if (info1) {
                    let lastId = info1[1] || 0;
                    let lastLevel = info1[2] || 0;
                    let instrumentData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
                    let instrumentLevel = instrumentData.getLevel();
                    if (instrumentId == lastId && instrumentLevel > lastLevel) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    private _checkHorseTrainPrompt(): boolean {
        let flag = G_UserData.getTeamCache().isShowHorseTrainFlag();
        if (!flag) {
            return false;
        }
        let pos = G_UserData.getTeam().getCurPos();
        let lastInfo1 = this._lastHorseLevel;
        for (let i = 1; i <= 1; i++) {
            let horseId = G_UserData.getBattleResource().getResourceId(pos, HorseConst.FLAG, i);
            if (horseId) {
                let info1 = lastInfo1[i];
                if (info1) {
                    let lastId = info1[1] || 0;
                    let lastLevel = info1[2] || 0;
                    let horseData = G_UserData.getHorse().getUnitDataWithId(horseId);
                    let star = horseData.getStar();
                    if (horseId == lastId && star > lastLevel) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    _checkHistoryHeroPrompt() {
        var flag = G_UserData.getTeamCache().isShowHistoryHeroFlag();
        if (!flag) {
            return false;
        }
        var pos = G_UserData.getTeam().getCurPos();
        var historyHeroIds = G_UserData.getHistoryHero().getHistoryHeroIds();
        var lastInfo1 = this._lastHistoryHeroLevel;
        var info1 = lastInfo1[pos];
        var historyHeroId = historyHeroIds[pos - 1];
        if (historyHeroId && historyHeroId > 0) {
            if (info1) {
                var lastId = info1[1] || 0;
                var lastLevel = info1[2] || 0;
                var historyHeroData = G_UserData.getHistoryHero().getHisoricalHeroValueById(historyHeroId);
                var level = historyHeroData.getBreak_through();
                if (historyHeroId != lastId || level != lastLevel) {
                    return true;
                }
            } else {
                return true;
            }
        } else {
            if (info1) {
                return true;
            }
        }
        return false;
    }
    private _playInstrumentTrainPrompt() {
        this._updateInstrument();
        this.checkHeroTrainRP();
        this._updatePower();
        let summary = [];
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _playHorseTrainPrompt() {
        this._updateHorse();
        this.checkHeroTrainRP();
        this._updatePower();
        let summary = [];
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    _playHistoryHeroTrainPrompt () {
        this._updateHistoryHero();
        this.checkHeroTrainRP();
        this._updatePower();
        var summary = [];
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _checkAvatarEquipPrompt() {
        let flag = G_UserData.getTeamCache().isShowAvatarEquipFlag();
        return flag;
    }
    private _playAvatarEquipPrompt() {
        this._updateBaseInfo();
        this._updateSkill();
        this._updateHorse();
        this._updatePower();
        let summary = [];
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    private _playOneKeyUnitEffect(index, crits?, saveMoney?, pos?) {
        let _this = this;
        let effectFunction = function (effect) {
            return new cc.Node();
        }
        let eventFunction = function (event) {
            if (event == 'finish') {
                if (crits && saveMoney && pos) {
                    let curPos = G_UserData.getTeam().getCurPos();
                    if (curPos >= 1 && curPos <= 6) {
                        _this._updateEquipment();
                        _this._updatePower();
                        _this._playEquipSuperUpgradeSummary(crits, saveMoney, pos);
                    }
                    _this._buttonOneKey.interactable = (true);
                }
            } else if (event == 'play') {
                let icon = (_this['_fileNodeEquip' + index] as TeamEquipIcon)._fileNodeCommon;
                G_EffectGfxMgr.applySingleGfx(icon.node, 'smoving_zhuangbei', null, null, null);

            }
        }
        let effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_yijianqianghua', effectFunction, eventFunction, false);
        effect.node.setPosition(UIHelper.convertSpaceFromNodeToNode((_this['_fileNodeEquip' + index] as TeamEquipIcon).node, this.node));
    }
    private _playOneKeyEffect(crits, saveMoney, pos) {
        let played = false;
        let indexs = this._oneKeyEquipIndexs;
        for (let slot in indexs) {
            let v = indexs[slot];
            if (!played) {
                this._playOneKeyUnitEffect(slot, crits, saveMoney, pos);
                played = true;
            } else {
                this._playOneKeyUnitEffect(slot);
            }
        }
        G_AudioManager.playSoundWithId(AudioConst.SOUND_EQUIP_STRENGTHEN);
    }
    getEquipmentIconByIndex(pos): TeamEquipIcon {
        return this['_fileNodeEquip' + pos];
    }
    getTreasureIconByIndex(pos): TeamTreasureIcon {
        return this['_fileNodeTreasure' + pos] as TeamTreasureIcon;
    }




}
