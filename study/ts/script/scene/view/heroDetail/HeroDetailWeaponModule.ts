const { ccclass, property } = cc._decorator;

import AttributeConst from '../../../const/AttributeConst';
import InstrumentConst from '../../../const/InstrumentConst';
import { HeroUnitData } from '../../../data/HeroUnitData';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Colors, G_SceneManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAttrNode from '../../../ui/component/CommonAttrNode';
import CommonButtonLevel2Highlight from '../../../ui/component/CommonButtonLevel2Highlight';
import { CommonDetailModule } from '../../../ui/component/CommonDetailModule';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import CommonInstrumentIcon from '../../../ui/component/CommonInstrumentIcon';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { InstrumentDataHelper } from '../../../utils/data/InstrumentDataHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';





var NORMAL_WIDTH = 80;
@ccclass
export default class HeroDetailWeaponModule extends ListViewCellBase implements CommonDetailModule{

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeDesc: cc.Node = null;

    @property({
        type: CommonInstrumentIcon,
        visible: true
    })
    _fileNodeIcon: CommonInstrumentIcon = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle: CommonDetailTitleWithBg = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBottom: cc.Node = null;

    @property({
        type: CommonButtonLevel2Highlight,
        visible: true
    })
    _buttonAdvance: CommonButtonLevel2Highlight = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr4: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr3: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1: CommonAttrNode = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel: cc.Label = null;
    constructor() {
        super();
    }

    private _heroUnitData: HeroUnitData;
    private _instrumentId: number;
    public setInitData(heroUnitData: HeroUnitData): void {
        this._heroUnitData = heroUnitData;
    }

    public numberOfCell(): number {
        return 1;
    }

    public cellAtIndex(i: number): cc.Node {
        this._nodeTitle.setFontSize(24);
        this._nodeTitle.setTitle(Lang.get('hero_detail_title_weapon'));
        this._buttonAdvance._text.string = (Lang.get('hero_detail_btn_advance'));
        var baseId = this._heroUnitData.getConfig().instrument_id;
        var level = 0;
        var limitLevel = 0;
        var attrInfo:any= {
            [AttributeConst.ATK]: 0,
            [AttributeConst.HP]: 0,
            [AttributeConst.PD]: 0,
            [AttributeConst.MD]: 0
        };
        var instrumentId = null;
        var heroUnitData = this._heroUnitData;
        var pos = heroUnitData.getPos();
        if (pos) {
            instrumentId = G_UserData.getBattleResource().getResourceId(pos, 3, 1);
        }
        if (instrumentId) {
            var unitData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
            level = unitData.getLevel();
            limitLevel = unitData.getLimit_level();
            attrInfo = InstrumentDataHelper.getInstrumentAttrInfo(unitData);
            this.delaySetButtonEnable(true);
        } else {
            this.delaySetButtonEnable(false);
        }
        this._fileNodeIcon.updateUI(baseId, null, limitLevel);
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, null, null, limitLevel);
        this._textName.string = (param.name);
        this._textName.node.color = (param.icon_color);
        UIHelper.updateTextOutline(this._textName, param);
        var label:cc.RichText = null;
        var showId = AvatarDataHelper.getShowHeroBaseIdByCheck(this._heroUnitData)[0];
        var description = AvatarDataHelper.getAvatarMappingConfig(showId).description;
        if (level >= param.unlock) {
            var content = Lang.get('instrument_detail_advance', {
                des: description,
                color: Colors.colorToNumber(Colors.BRIGHT_BG_GREEN)
            });
            label = RichTextExtend.createWithContent(content);
        } else {
            var content = Lang.get('instrument_detail_advance_unlock', {
                des: description,
                color: Colors.colorToNumber(Colors.BRIGHT_BG_TWO),
                level: param.unlock
            });
            label = RichTextExtend.createWithContent(content);
        }
        label.node.setAnchorPoint(new cc.Vec2(0, 1));
        // label.ignoreContentAdaptWithSize(false);
        label.maxWidth = 260
        // label.formatText();
        this._nodeDesc.addChild(label.node);
        var virtualContentSize = label.node.getContentSize();
        if (virtualContentSize.height > NORMAL_WIDTH) {
            var size = this._panelBg.getContentSize();
            var offsetY = virtualContentSize.height - NORMAL_WIDTH + 10;
            size.height = size.height + offsetY;
            this._panelBg.setContentSize(size);
            var posY = this._node.y;
            this._node.y = (posY + offsetY);
            var btPosY = this._nodeBottom.y;
            this._nodeBottom.y = (btPosY - offsetY);
        }
        this._textLevel.string = (Lang.get('hero_detail_instrument_advance_level', { level: level }));
        this._nodeAttr1.updateView(AttributeConst.ATK, attrInfo[AttributeConst.ATK], null, 4);
        this._nodeAttr2.updateView(AttributeConst.HP, attrInfo[AttributeConst.HP], null, 4);
        this._nodeAttr3.updateView(AttributeConst.PD, attrInfo[AttributeConst.PD], null, 4);
        this._nodeAttr4.updateView(AttributeConst.MD, attrInfo[AttributeConst.MD], null, 4);
        if (!heroUnitData.isUserHero()) {
            var size = this._panelBg.getContentSize();
            size.height = size.height - 54;
            this._panelBg.setContentSize(size);
            var posY = this._node.y;
            this._node.y = (posY - 54);
        }
        var contentSize = this._panelBg.getContentSize();
        this.node.setContentSize(contentSize);
        this._buttonAdvance.node.active = (heroUnitData.isUserHero());
        var _panelBg = this._panelBg;
        this.scheduleOnce(function () {
            _panelBg.setPosition(0, 0);
        }, 0)

        return this.node;
    }

    delaySetButtonEnable(flag) {
        this.scheduleOnce(()=>{
            this._buttonAdvance.setEnabled(flag);
        })
    }

    _onClickIcon1() {
        var itemParam1 = this._fileNodeIcon.getItemParams();
        UIPopupHelper.popupItemGuider(function(popupItemGuider:PopupItemGuider){
            popupItemGuider.updateUI(TypeConvertHelper.TYPE_EQUIPMENT, itemParam1.cfg.id);
            popupItemGuider.setTitle(Lang.get('way_type_get'));
        }.bind(this))
    }
    _onButtonAdvanceClicked() {
        G_SceneManager.showScene('instrumentTrain', this._instrumentId, InstrumentConst.INSTRUMENT_TRAIN_ADVANCE, InstrumentConst.INSTRUMENT_RANGE_TYPE_2);
    }

}