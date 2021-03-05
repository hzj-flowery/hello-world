import AttributeConst from "../../../const/AttributeConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { HeroConst } from "../../../const/HeroConst";
import { SilkbagConst } from "../../../const/SilkbagConst";
import { HeroUnitData } from "../../../data/HeroUnitData";
import { UserDetailData } from "../../../data/UserDetailData";
import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonAttrNode from "../../../ui/component/CommonAttrNode";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import CommonHeroCountry from "../../../ui/component/CommonHeroCountry";
import CommonHeroName from "../../../ui/component/CommonHeroName";
import CommonHeroPower from "../../../ui/component/CommonHeroPower";
import CommonHeroStar from "../../../ui/component/CommonHeroStar";
import CommonSkillIcon from "../../../ui/component/CommonSkillIcon";
import CommonUI from "../../../ui/component/CommonUI";
import { AttrDataHelper } from "../../../utils/data/AttrDataHelper";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { Path } from "../../../utils/Path";
import ViewBase from "../../ViewBase";
import HeroTrainHelper from "../heroTrain/HeroTrainHelper";
import SilkbagIcon from "../silkbag/SilkbagIcon";
import TeamEquipIcon from "./TeamEquipIcon";
import TeamHistoryHeroIcon from "./TeamHistoryHeroIcon";
import TeamHorseIcon from "./TeamHorseIcon";
import TeamInstrumentIcon from "./TeamInstrumentIcon";
import TeamTacticsPositionIcon from "./TeamTacticsPositionIcon";
import TeamTreasureIcon from "./TeamTreasureIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UserDetailHeroNode extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBtnBg: cc.Sprite = null;

    @property({
        type: CommonHeroPower,
        visible: true
    })
    _fileNodePower: CommonHeroPower = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDetail: cc.Node = null;

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
        type: TeamInstrumentIcon,
        visible: true
    })
    _fileNodeInstrument: TeamInstrumentIcon = null;

    @property({
        type: TeamHorseIcon,
        visible: true
    })
    _fileNodeHorse: TeamHorseIcon = null;

    @property({
        type: TeamHistoryHeroIcon,
        visible: true
    })
    _fileNodeHistoryHero: TeamHistoryHeroIcon = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonSilkbag: cc.Button = null;

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
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeDetailTitleKarma: CommonDetailTitleWithBg = null;

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
        type: CommonDetailTitleWithBg,
        visible: true
    }) _nodeDetailTitleTactics: CommonDetailTitleWithBg = null;

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
    _panelSilkbag: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonEquip: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonJade: cc.Button = null;

    private _parentView: any;
    private _detailData: UserDetailData;
    private _silkbagIcon: SilkbagIcon;
    private _silkbagIconPrefab: any;
    _isShowAwake: any;
    private _historyHero: any;
    private _scAttr: any;
    @property({
        type: cc.Node,
        visible: true
    }) _panelBasic: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    }) _panelKarma: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    }) _nodePanelYoke: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    }) _panelTactics: cc.Node = null;

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
    private _karamOffset: number;
    setInitData(parentView, detailData) {
        this._parentView = parentView;
        this._detailData = detailData;
        // var resource = {
        //     file: Path.getCSB('UserDetailHeroNode', 'common'),
        //     binding: {
        //         _buttonSilkbag: {
        //             events: [{
        //                     event: 'touch',
        //                     method: '_onButtonSilkbagClicked'
        //                 }]
        //         }
        //         _buttonEquip: {
        //             events: [{
        //                     event: 'touch',
        //                     method: '_onButtonEquipClicked'
        //                 }]
        //         }
        //     }
        // };
    }

    private _switchIndex: number;
    private _curHeroData: HeroUnitData;
    private _allYokeData: any;
    private _pos: number;
    private _instrument: TeamInstrumentIcon;
    private _horse: TeamHorseIcon;
    private _showSilkbagIcons: Array<SilkbagIcon>;
    onCreate() {

        //该按钮没有发现他的使用 暂时隐藏
        this._fileNodeHistoryHero.node.active = false;

        this._silkbagIconPrefab = cc.resources.get(Path.getPrefab("SilkbagIcon", "silkbag"));
        this._initData();
        this._initView();
    }
    _initData() {
        this._switchIndex = 1;
    }
    _initView() {
        this._nodeDetailTitleBasic.setTitle(Lang.get('team_detail_title_basic'));
        this._nodeDetailTitleKarma.setTitle(Lang.get('team_detail_title_karma'));
        this._nodeDetailTitleTactics.setTitle(Lang.get('team_detail_title_tactics'));
        this._nodeDetailTitleYoke.setTitle(Lang.get('team_detail_title_yoke'));
        this._nodeLevel.setFontSize(17);
        this._nodePotential.setFontSize(17);
        for (var i = 1; i <= 4; i++) {
            (this['_fileNodeAttr' + i] as CommonAttrNode).setFontSize(17);
        }
        this._initTacticsNode();
        this._instrument = this._fileNodeInstrument;
        this._horse = this._fileNodeHorse;
        for (var i = 1; i <= SilkbagConst.SLOT_MAX; i++) {
            var nodesilk = (cc.instantiate(this._silkbagIconPrefab) as cc.Node).getComponent(SilkbagIcon);
            nodesilk.ctor(i, null);
            (this['_silkbagIcon' + i] as SilkbagIcon) = nodesilk;
            (this['_silkbagIcon' + i] as SilkbagIcon).node.setScale(0.8);
            this._panelSilkbag.addChild((this['_silkbagIcon' + i] as SilkbagIcon).node);
        }
        var count2Pos = {
            1: [new cc.Vec2(247, 425)],
            2: [
                new cc.Vec2(105, 405),
                new cc.Vec2(390, 405)
            ],
            3: [
                new cc.Vec2(247, 425),
                new cc.Vec2(115, 198),
                new cc.Vec2(380, 198)
            ],
            4: [
                new cc.Vec2(140, 381),
                new cc.Vec2(356, 381),
                new cc.Vec2(140, 168),
                new cc.Vec2(355, 168)
            ],
            5: [
                new cc.Vec2(247, 425),
                new cc.Vec2(102, 322),
                new cc.Vec2(391, 322),
                new cc.Vec2(158, 152),
                new cc.Vec2(337, 152)
            ],
            6: [
                new cc.Vec2(247, 425),
                new cc.Vec2(116, 350),
                new cc.Vec2(379, 350),
                new cc.Vec2(115, 198),
                new cc.Vec2(379, 198),
                new cc.Vec2(247, 123)
            ],
            7: [
                new cc.Vec2(247, 425),
                new cc.Vec2(128, 370),
                new cc.Vec2(365, 370),
                new cc.Vec2(99, 241),
                new cc.Vec2(396, 241),
                new cc.Vec2(180, 139),
                new cc.Vec2(313, 139)
            ],
            8: [
                new cc.Vec2(247, 425),
                new cc.Vec2(140, 382),
                new cc.Vec2(356, 382),
                new cc.Vec2(94, 275),
                new cc.Vec2(399, 275),
                new cc.Vec2(139, 168),
                new cc.Vec2(354, 168),
                new cc.Vec2(247, 123)
            ],
            9: [
                new cc.Vec2(247, 425),
                new cc.Vec2(148, 392),
                new cc.Vec2(345, 392),
                new cc.Vec2(97, 302),
                new cc.Vec2(398, 302),
                new cc.Vec2(115, 200),
                new cc.Vec2(380, 200),
                new cc.Vec2(196, 132),
                new cc.Vec2(300, 132)
            ],
            10: [
                new cc.Vec2(201, 420),
                new cc.Vec2(294, 420),
                new cc.Vec2(125, 365),
                new cc.Vec2(370, 365),
                new cc.Vec2(95, 276),
                new cc.Vec2(398, 276),
                new cc.Vec2(125, 186),
                new cc.Vec2(370, 186),
                new cc.Vec2(200, 131),
                new cc.Vec2(293, 131)
            ]
        };
        var isTacticsOpen = this._detailData.funcIsOpened(FunctionConst.FUNC_TACTICS);
        this._panelTactics.active = (isTacticsOpen);
        var count = 0;
        for (var i = 1; i <= SilkbagConst.SLOT_MAX; i++) {
            var isOpen = this._detailData.funcIsOpened(FunctionConst['FUNC_SILKBAG_SLOT' + i]);
            if (isOpen) {
                count = i;
            } else {
                break;
            }
        }
        this._showSilkbagIcons = [];
        for (var i = 1; i <= SilkbagConst.SLOT_MAX; i++) {
            if (i <= count) {
                (this['_silkbagIcon' + i] as SilkbagIcon).node.active = (true);
                (this['_silkbagIcon' + i] as SilkbagIcon).setPosition(count2Pos[count][i - 1]);
                this._showSilkbagIcons.push((this['_silkbagIcon' + i] as SilkbagIcon));
            } else {
                (this['_silkbagIcon' + i] as SilkbagIcon).node.active = (false);
            }
        }
    }
    
    _initTacticsNode() {

    }
    onEnter() {
    }
    onExit() {
    }
    updateInfo(pos) {
        this._updateData(pos);
        this._updateView();
        this._switchEquipOrSilkbag();
    }
    _updateData(pos) {
        this._pos = pos;
        this._curHeroData = this._detailData.getHeroDataWithPos(pos);
        if (this._curHeroData) {
            this._allYokeData = UserDataHelper.getHeroYokeInfo(this._curHeroData);
        }
    }
    _updateView() {
        this._updateBaseInfo();
        this._updateAttr();
        this._updateSkill();
        this._updateKarma();
        this._updateTacticsPos();
        this._updateYoke();
        this._updateEquipment();
        this._updateTreasure();
        this._updateInstrument();
        this._updateHorse();
        this._updateHistoryHero();
        this._updateSilkbag();
        this._updatePower();
        this._updateSilkbagBtn();
    }
    _updateBaseInfo() {
        var level = this._curHeroData.getLevel();
        var heroConfig = this._curHeroData.getConfig();
        var rank = this._curHeroData.getRank_lv();
        var maxLevel = this._detailData.getLevel();
        if (this._curHeroData.isPureGoldHero()) {
            this._nodeLevel.updateUI(Lang.get('goldenhero_train_des'), rank, rank);
            this._nodeLevel.setMaxValue('');
        } else {
            this._nodeLevel.updateUI(Lang.get('team_detail_des_level'), level, maxLevel, 10);
            this._nodeLevel.setMaxValue('/' + maxLevel);
        }
        this._nodePotential.updateUI(Lang.get('team_detail_des_potential'), heroConfig.potential, null, 10);
        this._fileNodeCountry.updateUI(this._curHeroData.getBase_id());
        if (this._pos == 1) {
            this._fileNodeHeroName.setNameInUserDetail(this._detailData.getName(), this._detailData.getOfficeLevel(), rank);
        } else {
            this._fileNodeHeroName.setName(this._curHeroData.getBase_id(), rank, this._curHeroData.getLimit_level(), null, this._curHeroData.getLimit_rtg());
        }
        this._updateAwake();
    }
    _updateAttr() {
        var attrInfo = UserDataHelper.getOtherUserTotalAttr(this._curHeroData, this._detailData);
        this._fileNodeAttr1.updateView(AttributeConst.ATK, attrInfo[AttributeConst.ATK], 10);
        this._fileNodeAttr2.updateView(AttributeConst.PD, attrInfo[AttributeConst.PD], 10);
        this._fileNodeAttr3.updateView(AttributeConst.HP, attrInfo[AttributeConst.HP], 10);
        this._fileNodeAttr4.updateView(AttributeConst.MD, attrInfo[AttributeConst.MD], 10);
    }
    _updateSkill() {
        var skillIds = {};
        var avatarBaseId = this._detailData.getAvatarBaseId();
        if (avatarBaseId > 0 && this._curHeroData.isLeader()) {
            var heroBaseId = AvatarDataHelper.getAvatarConfig(avatarBaseId).hero_id;
            var limitLevel = this._curHeroData.getLimit_level();
            var limitRedLevel = this._curHeroData.getLimit_rtg();
            skillIds = HeroDataHelper.getSkillIdsWithBaseIdAndRank(heroBaseId, 0, limitLevel, limitRedLevel);
        } else {
            skillIds = HeroDataHelper.getSkillIdsWithHeroData(this._curHeroData);
        }
        for (var i = 1; i <= 3; i++) {
            var skillId = skillIds[i];
            this['_fileNodeSkill' + i].updateUI(skillId, true);
        }
    }
    _updateTacticsPos() {
        var isTacticsPos3Show = this._detailData.funcIsShow(FunctionConst.FUNC_TACTICS_POS3);
        var pos = this._pos;
        if (!isTacticsPos3Show) {
            var posX = [
                100,
                208
            ];
            for (var i = 1; i <= 2; i++) {
                this['_nodeTactics' + i].x = (posX[i-1]);
                var [state, tacticsUnitData] = this._detailData.getTacticsPosState(pos, i);
                this['_fileNodeTactics' + i].updateUIWithFixState(state, i, tacticsUnitData);
            }
            this['_nodeTactics' + 3].active = (false);
        } else {
            for (var i = 1; i <= 3; i++) {
                var [state, tacticsUnitData] = this._detailData.getTacticsPosState(pos, i);
                this['_fileNodeTactics' + i].updateUIWithFixState(state, i, tacticsUnitData);
            }
            this['_nodeTactics' + 3].active = (true);
        }
    }
    _updateAttrScrollView() {
        var isTacticsOpen = this._detailData.funcIsOpened(FunctionConst.FUNC_TACTICS);
        this._panelTactics.active = (isTacticsOpen);
        if (!isTacticsOpen) {
            var offset = 158;
            var height = 566;
            var contentSize = this._scAttr.getInnerContainerSize();
            var size = cc.size(contentSize.width, height);
            this._scAttr.setInnerContainerSize(size);
            this._scAttr.setTouchEnabled(false);
            this._panelBasic.y = (452 - offset - 200);
            this._panelKarma.y = (295 - offset + 60 + 25);
            this._nodePanelYoke.y = (this._karamOffset - 30 + 90);
        } else {
            var offset = this._karamOffset;
            var height = 158 + 566 - offset - 110 + 10;
            var contentSize = this._scAttr.getInnerContainerSize();
            var size = cc.size(contentSize.width, height);
            this._scAttr.setInnerContainerSize(size);
            this._scAttr.setTouchEnabled(true);
            this._panelBasic.y = (452 - offset - 200 - 110);
            this._panelTactics.y = (323 - offset + 60 - 110);
            this._panelKarma.y = (145 - offset + 120 - 110 - 10);
            this._nodePanelYoke.y = (-25 + 130 - 110 - 10);
        }
    }
    _updateKarma() {
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
        for (var i = 0; i < HeroConst.HERO_KARMA_MAX; i++) {
            var data = allKaramData[i];
            if (data) {
                var isReach = UserDataHelper.getReachCond(this._curHeroData, data['cond1'], data['cond2'], this._detailData.getLevel(), this._detailData.getOfficeLevel());
                var isActivated = this._detailData.isKarmaActivated(data.id);
                if (isActivated || isReach) {
                    count = count + 1;
                    var text = this['_textYuanFenDes' + count] as cc.Label;
                    var mark = this['_imageYuanFenMark' + count] as cc.Sprite;
                    var bg = this['_imageYuanFenBg' + count] as cc.Sprite;
                    text.node.active = (true);
                    var markInfo = imageMark[data.attrId];
                    //assert((markInfo, cc.js.formatStr('hero_friend config talent_attr is wrong = %d', data.attrId));
                    var markRes = isActivated && markInfo[0] || markInfo[1];
                    var color = isActivated && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
                    text.string = (data.karmaName);
                    text.node.color = (color);
                    mark.node.active = (true);
                    mark.addComponent(CommonUI).loadTexture(Path.getTeamUI(markRes));
                    bg.node.active = (false);
                }
            }
            let totalCount = HeroConst.HERO_KARMA_MAX;
            if (HeroConst.HERO_KARMA_MAX < 8) {
                totalCount = 8;
            }
            for (var j = count + 1; j <= totalCount; j++) {
                this['_textYuanFenDes' + j].node.active = (false);
                this['_imageYuanFenMark' + j].node.active = (false);
                this['_imageYuanFenBg' + j].node.active = (false);
            }
            var LINE_HEIGHT = 25;
            var line = Math.ceil(count / 2);
            this._karamOffset = (5 - line) * LINE_HEIGHT;
            this._nodePanelYoke.y = ((0 - line) * LINE_HEIGHT - 20);
        }
    }
    _updateYoke() {
        for (var i = 1; i <= 6; i++) {
            this._updateOneYoke(i);
        }
    }
    _updateOneYoke(index) {
        var allYokeData = this._allYokeData;
        var text = this['_textJiBanDes' + index] as cc.Label;
        var mark = this['_imageJiBanMark' + index] as cc.Sprite;
        if (allYokeData && allYokeData.yokeInfo && allYokeData.yokeInfo[index]) {
            var info = allYokeData.yokeInfo[index - 1];
            text.node.active = (true);
            var color = info.isActivated && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
            text.string = (info.name);
            text.node.color = (color);
            mark.node.active = (info.isActivated);
        } else {
            text.node.active = (false);
            mark.node.active = (false);
        }
    }
    _updateEquipment() {
        var curPos = this._pos;
        var heroData = this._detailData.getHeroDataWithPos(curPos);
        var heroBaseId = null;
        if (heroData) {
            heroBaseId = heroData.getAvatarToHeroBaseIdByAvatarId(this._detailData.getAvatarBaseId());
        }
        for (var i = 1; i <= 4; i++) {
            var equipIcon = this['_fileNodeEquip' + i];
            var equipData = this._detailData.getEquipData(curPos, i);
            var isShow = this._detailData.isShowEquipJade();
            equipIcon.onlyShow(i, equipData, isShow, heroBaseId);
        }
    }
    _updateTreasure() {
        var curPos = this._pos;
        var heroData = this._detailData.getHeroDataWithPos(curPos);
        var heroBaseId = null;
        if (heroData) {
            heroBaseId = heroData.getAvatarToHeroBaseIdByAvatarId(this._detailData.getAvatarBaseId());
        }
        for (var i = 1; i <= 2; i++) {
            var treasureIcon = this['_fileNodeTreasure' + i];
            var treasureData = this._detailData.getTreasureData(curPos, i);
            var isShow = this._detailData.isShowTreasureJade();
            treasureIcon.onlyShow(i, treasureData, isShow, heroBaseId);
        }
    }
    _updateInstrument() {
        var curPos = this._pos;
        var data = this._detailData.getInstrumentData(curPos, 1);
        this._instrument.onlyShow(data);
        this._instrument.showTextBg(false);
    }
    _updateHorse() {
        var isOpen = this._detailData.funcIsOpened(FunctionConst.FUNC_HORSE);
        if (!isOpen) {
            this._fileNodeHorse.node.active = (false);
            return;
        }
        this._fileNodeHorse.node.active = (true);
        var curPos = this._pos;
        var data = this._detailData.getHorseData(curPos, 1);
        var horseEquipData = this._detailData.getHorseEquipData();
        this._horse.onlyShow(data, horseEquipData);
    }
    _updateHistoryHero() {
        var isOpen = this._detailData.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO);
        if (!isOpen) {
            this._fileNodeHistoryHero.node.active = (false);
            return;
        }
        this._fileNodeHistoryHero.node.active = (true);
        var curPos = this._pos;
        var historyHeroData = this._detailData.getHistoryHeroData(curPos);
        this._fileNodeHistoryHero.onlyShow(historyHeroData);
    }
    _updateSilkbag() {
        var curPos = this._pos;
        for (var i = 1; i <= SilkbagConst.SLOT_MAX; i++) {
            this['_silkbagIcon' + i].onlyShow(curPos, this._detailData);
        }
    }
    _updatePower() {
        var attrInfo = UserDataHelper.getOtherHeroPowerAttr(this._curHeroData, this._detailData);
        var power = AttrDataHelper.getPower(attrInfo);
        this._fileNodePower.updateUI(power);
        var width = this._fileNodePower.getWidth();
        var panelWidth = this._imageBtnBg.node.getContentSize().width;
        // var posX = (panelWidth - width) / 2;
        // this._fileNodePower.node.x = (posX);
    }
    _updateAwake() {
        var visible = false;
        var star = 0;
        var isOpen = HeroTrainHelper.checkIsReachAwakeInitLevel(this._curHeroData);
        var isCanAwake = this._curHeroData.isCanAwake();
        this._isShowAwake = isOpen && isCanAwake;
        this._isShowAwake = isOpen && isCanAwake;
        if (this._isShowAwake) {
            this._imageAwakeBg.node.active = (true);
            var awakeLevel = this._curHeroData.getAwaken_level();
            star = UserDataHelper.convertAwakeLevel(awakeLevel)[0];
            this._nodeHeroStar.setStarOrMoon(star);
            visible = true;
        } else {
            this._imageAwakeBg.node.active = (false);
            visible = false;
        }
        this._parentView.updateAwake(visible, star);
    }
    private onButtonSilkbagClicked() {
        this._switchIndex = 2;
        this._switchEquipOrSilkbag();
    }
    private onButtonEquipClicked() {
        this._switchIndex = 1;
        this._switchEquipOrSilkbag();
    }
    _switchEquipOrSilkbag() {
        if (this._switchIndex == 1) {
            this._panelDetail.active = (true);
            this._panelSilkbag.active = (false);
            this._parentView.updateAwake(this._isShowAwake);
        } else if (this._switchIndex == 2) {
            this._panelDetail.active = (false);
            this._panelSilkbag.active = (true);
            this._parentView.updateAwake(false);
        }
    }
    _updateSilkbagBtn() {
        var isOpen = this._detailData.funcIsOpened(FunctionConst.FUNC_SILKBAG);
        this._buttonSilkbag.node.active = (isOpen);
    }

}