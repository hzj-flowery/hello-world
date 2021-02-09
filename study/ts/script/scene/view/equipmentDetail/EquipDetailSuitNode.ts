const { ccclass, property } = cc._decorator;

import CommonButtonLevel2Highlight from '../../../ui/component/CommonButtonLevel2Highlight'

import EquipDetailSuitIcon from './EquipDetailSuitIcon'

import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'
import { Lang } from '../../../lang/Lang';
import { FunctionConst } from '../../../const/FunctionConst';
import { G_UserData, G_SceneManager, Colors } from '../../../init';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { TextHelper } from '../../../utils/TextHelper';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { EquipTrainHelper } from '../equipTrain/EquipTrainHelper';
import EquipConst from '../../../const/EquipConst';
import { handler } from '../../../utils/handler';
import { EquipDataHelper } from '../../../utils/data/EquipDataHelper';
import { TeamDataHelper } from '../../../utils/data/TeamDataHelper';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class EquipDetailSuitNode extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle: CommonDetailTitleWithBg = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: EquipDetailSuitIcon,
        visible: true
    })
    _fileNodeIcon1: EquipDetailSuitIcon = null;

    @property({
        type: EquipDetailSuitIcon,
        visible: true
    })
    _fileNodeIcon2: EquipDetailSuitIcon = null;

    @property({
        type: EquipDetailSuitIcon,
        visible: true
    })
    _fileNodeIcon3: EquipDetailSuitIcon = null;

    @property({
        type: EquipDetailSuitIcon,
        visible: true
    })
    _fileNodeIcon4: EquipDetailSuitIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle3: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textValue1_1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textValue1_2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textValue2_1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textValue2_2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textValue3_1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textValue3_2: cc.Label = null;

    @property({
        type: CommonButtonLevel2Highlight,
        visible: true
    })
    _buttonLimit: CommonButtonLevel2Highlight = null;
    _suitId: number;
    _unitData: any;
    _isNeedLimit: any;
    _fromLimit: any;
    _equipIcons: EquipDetailSuitIcon[];


    onLoad() {
        var size = this._panelBg.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._nodeTitle.setTitle(Lang.get('equipment_detail_title_suit'));
        this._equipIcons = [];
        for (var i = 1; i <= 4; i++) {
            this._equipIcons.push(this['_fileNodeIcon' + i])
        }
        this._buttonLimit.addClickEventListenerEx(handler(this, this._onLimitButtonClicked));
    }

    setEquipData(unitData, isNeedLimit?, fromLimit?) {
        this._suitId = 0;
        this._unitData = unitData;
        this._isNeedLimit = isNeedLimit || false;
        this._fromLimit = fromLimit || false;
        this._updateView();
        this._initLimitButton();
    }

    _initLimitButton() {
        this._buttonLimit.setString(Lang.get('instrument_limit_btn'));
        var isShow = this._isNeedLimit && FunctionCheck.funcIsShow(FunctionConst.FUNC_EQUIP_TRAIN_TYPE4);
        this._buttonLimit.node.active = (isShow);
        this._buttonLimit.setEnabled(FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE4)[0]);
        if (isShow) {
            var isRed = EquipTrainHelper.isNeedRedPoint();
            this._buttonLimit.showRedPoint(isRed);
        }
    }
    _onLimitButtonClicked() {
        var equipId = G_UserData.getEquipment().getCurEquipId();
        G_SceneManager.showScene('equipTrain', equipId, EquipConst.EQUIP_TRAIN_LIMIT, EquipConst.EQUIP_RANGE_TYPE_2, true);
    }
    _updateView() {
        var suitId = this._unitData.getConfig().suit_id;
        for (var i = 1; i <= 3; i++) {
            for (var j = 1; j <= 2; j++) {
                if (this['_textValue' + (i + ('_' + j))]) {
                    this['_textValue' + (i + ('_' + j))].node.active = (false);
                }
            }
        }
        var colorParam = null;
        var componentCount = 0;
        var componentIds = EquipDataHelper.getSuitComponentIds(suitId);
        for (var k in componentIds) {
            var id = componentIds[k];
            var icon = this._equipIcons[k];
            var pos = this._unitData.getPos();
            var isHave = TeamDataHelper.isHaveEquipInPos(id, pos);
            var needMask = !isHave;
            icon.updateView(id, needMask);
            if (!needMask && !this._fromLimit) {
                componentCount = componentCount + 1;
            }
            if (colorParam == null) {
                colorParam = {};
                var equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, id);
                colorParam.icon_color = equipParam.icon_color;
                colorParam.icon_color_outline = equipParam.icon_color_outline;
            }
        }
        var name = EquipDataHelper.getSuitName(suitId);
        this._textName.string = (name);
        this._textName.node.color = (colorParam.icon_color);
        UIHelper.enableOutline(this._textName, colorParam.icon_color_outline);
        var attrInfo = EquipDataHelper.getSuitAttrShowInfo(suitId);
        for (k in attrInfo) {
            var one = attrInfo[k];
            k = (parseFloat(k) + 1).toString();
            var count = one.count;
            var colorName = componentCount >= count && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
            var colorAttr = componentCount >= count && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
            this['_textTitle' + k].string = (Lang.get('equipment_detail_suit_count', { count: count }));
            this['_textTitle' + k].node.color = (colorName);
            var info = one.info;
            for (var m in info) {
                var data = info[m];
                m = (parseFloat(m) + 1).toString();
                var arr = TextHelper.getAttrBasicText(data.type, data.value);
                var name = arr[0], value = arr[1];
                var text = this['_textValue' + (k + ('_' + m))];
                if (text) {
                    text.string = (Lang.get('equipment_detail_suit_attr', {
                        name: name,
                        value: value
                    }));
                    text.node.color = (colorAttr);
                    text.node.active = (true);
                }
            }
        }
    }
    setIconMask(needMask) {
        for (var i in this._equipIcons) {
            var icon = this._equipIcons[i];
            icon.setIconMask(needMask);
        }
    }

}