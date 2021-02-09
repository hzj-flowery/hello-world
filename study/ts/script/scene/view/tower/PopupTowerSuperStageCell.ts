const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { G_ConfigLoader, G_UserData } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';

@ccclass
export default class PopupTowerSuperStageCell extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _heroIcon: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textStageName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOpen: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLight: cc.Sprite = null;

    private _customCallback;
    private _index;

    public onLoad() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._resourceNode.on(cc.Node.EventType.TOUCH_START,handler(this,this._onTouchCallBack));
    }

    private _getEquipStageConfig(id) {
        if (id == 0) {
            return null;
        }
        var EquipStage = G_ConfigLoader.getConfig(ConfigNameConst.EQUIP_STAGE);
        var equipStageConfig = EquipStage.get(id);
        return equipStageConfig;
    }

    public updateInfo(data, index, selectIndex, lastOpenIndex) {
        this._index = index;
        var open = G_UserData.getTowerData().isSuperStageOpen(data.getId());
        var config = data.getConfig();
        var name = data.getConfig().name;
        var needStageUnit = G_UserData.getTowerData().getSuperStageUnitData(config.need_id);
        var preStageName = needStageUnit && needStageUnit.getConfig().name || '';
        var needShowNormalStageName = false;
        if (needStageUnit && needStageUnit.isPass()) {
            needShowNormalStageName = true;
        }
        if (!needStageUnit) {
            needShowNormalStageName = true;
        }
        if (lastOpenIndex + 3 == index) {
            needShowNormalStageName = true;
        }
        if (needShowNormalStageName && config.need_equip_stage != 0) {
        }
        this.setSelected(index == selectIndex);
        this._heroIcon.unInitUI();
        this._heroIcon.initUI(TypeConvertHelper.TYPE_HERO, config.res_id);
        this._heroIcon.setIconMask(!open);
        this._heroIcon.setImageTemplateVisible(true);
        var itemParams = this._heroIcon.getItemParams();
        this._textOpen.string = (Lang.get('challenge_tower_pass_condition', { name: preStageName }));
        this._textStageName.string = (name);
        this._textStageName.node.color = (itemParams.icon_color);
        this._textOpen.node.active = (!open);
        this._textStageName.node.active = (open);
    }

    public setSelected(selected) {
        this._imageArrow.node.active = (selected);
        this._imageLight.node.active = (selected);
    }

    private _onTouchCallBack(sender, state) {
        if(this._customCallback)
        {
            this._customCallback(this._index);
        }
    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }
}