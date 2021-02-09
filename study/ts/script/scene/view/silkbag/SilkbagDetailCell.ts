const { ccclass, property } = cc._decorator;

import CommonSilkbagIcon from '../../../ui/component/CommonSilkbagIcon'
import CommonListItem from '../../../ui/component/CommonListItem';
import { G_UserData, Colors, G_ConfigLoader } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { SilkbagConst } from '../../../const/SilkbagConst';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { ConfigNameConst } from '../../../const/ConfigNameConst';

@ccclass
export default class SilkbagDetailCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonSilkbagIcon,
        visible: true
    })
    _fileNodeIcon: CommonSilkbagIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDes: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMark: cc.Sprite = null;
    _textDesTrue: cc.Label;

    // onLoad() {
    //     this._initDesc();
    // }

    // _initDesc() {
    //     var size = this._textDes.getContentSize();
    //     var sc = new ccui.ScrollView();
    //     sc.setBounceEnabled(true);
    //     sc.setDirection(ccui.ScrollViewDir.vertical);
    //     sc.setTouchEnabled(true);
    //     sc.setSwallowTouches(true);
    //     sc.setScrollBarEnabled(false);
    //     sc.setContentSize(size);
    //     var label = UIHelper.createWithTTF('', Path.getCommonFont(), this._textDes.fontSize);
    //     label.node.color = (this._textDes.node.color;
    //     label.node.width = (size.width);
    //     label.node. setAnchorPoint(cc.v2(0, 1));
    //     this._textDesTrue = label;
    //     this._textDes.node.parent.addChild(sc);
    //     sc.setAnchorPoint(this._textDes.getAnchorPoint());
    //     sc.setPosition(cc.p(this._textDes.getPosition()));
    //     this._textDes.setVisible(false);
    //     sc.addChild(label);
    //     this._textDescSc = sc;
    // }

    // _updateDesc(strDesc, color) {
    //     this._textDesTrue.setString(strDesc);
    //     this._textDesTrue.setColor(color);
    //     var labelSize = this._textDesTrue.getContentSize();
    //     this._textDescSc.setInnerContainerSize(labelSize);
    //     var orgHeight = this._textDescSc.getContentSize().height;
    //     var height = math.max(orgHeight, labelSize.height);
    //     this._textDesTrue.setPosition(cc.p(0, height));
    //     var enable = labelSize.height > orgHeight;
    //     this._textDescSc.setTouchEnabled(enable);
    //     this._textDescSc.setSwallowTouches(enable);
    // }

    updateUI(itemId, datas) {
        var data = datas[0]
        var isSeasonSilk = datas[1];
        if (isSeasonSilk) {
            this.update2(data);
        } else {
            this.update1(data);
        }
    }
    update1(data) {
        var silkbagId = data.silkbagId;
        var isEffective = data.isEffective;
        var unitData = G_UserData.getSilkbag().getUnitDataWithId(silkbagId);
        var info = unitData.getConfig();
        var nameTemp = Lang.get('silkbag_name_title', { name: info.name });
        var nameStr = info.only == SilkbagConst.ONLY_TYPE_1 ? Lang.get('silkbag_only_tip', { name: nameTemp }) : nameTemp;
        var baseId = unitData.getBase_id();
        var params = this._fileNodeIcon.updateUI(baseId);
        this._textName.string = (nameStr);
        this._textName.node.color = (params.icon_color);
        UIHelper.updateTextOutline(this._textName, params);
        var markRes = isEffective ? Path.getTextSignet('img_silkbag01') : Path.getTextSignet('img_silkbag02');
        UIHelper.loadTexture(this._imageMark, markRes);
        var desColor = isEffective ? Colors.SYSTEM_TARGET : Colors.SYSTEM_TARGET_RED;
        var description = info.description;
        if (info.type1 > 0) {
            var tempLevel = parseFloat(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.SILKBAG_START_LV).content);
            description = '';
            var userLevel = G_UserData.getBase().getLevel();
            for (var i = 1; i <= 2; i++) {
                var attrId = info['type' + i];
                if (attrId > 0) {
                    var size = info['size' + i];
                    var growth = info['growth' + i];
                    var ratio = Math.max(userLevel - tempLevel, 0);
                    var attrValue = size + growth * ratio;
                    var arr = TextHelper.getAttrBasicText(attrId, attrValue);
                    var name = arr[0], value = arr[1];
                    description = description + (name + ('+' + value));
                }
            }
        }
        this._textDes.string = (description);
        this._textDes.node.color = (desColor);
    }
    update2(data) {
        this._fileNodeIcon.updateUI(data.baseId);
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, data.baseId);
        this._textName.string = (param.name);
        this._textName.node.color = (param.icon_color);
        UIHelper.updateTextOutline(this._textName, param);
        var markRes = data.isEffective ? Path.getTextSignet('img_silkbag01') : Path.getTextSignet('img_silkbag02');
        var desColor = data.isEffective ? Colors.SYSTEM_TARGET : Colors.SYSTEM_TARGET_RED;
        this._textDes.string = (param.description);
        this._textDes.node.color = (desColor);
        this._imageMark.node.active = (false);
    }

}