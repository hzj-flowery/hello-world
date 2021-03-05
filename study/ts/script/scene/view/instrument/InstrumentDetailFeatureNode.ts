import ListViewCellBase from "../../../ui/ListViewCellBase";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Lang } from "../../../lang/Lang";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { G_UserData, Colors } from "../../../init";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { InstrumentUnitData } from "../../../data/InstrumentUnitData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class InstrumentDetailFeatureNode extends ListViewCellBase {

    @property({
        type: CommonCustomListView,
        visible: true
    })
    _listView: CommonCustomListView = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _CommonDetailTitleWithBg: cc.Prefab = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _titleNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _featureNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _textDesNode: cc.Node = null;

    private _instrumentData: InstrumentUnitData;
    private _isLoaded: boolean = false;

    init(instrumentData) {
        this._instrumentData = instrumentData;
    }

    onCreate() {
        if (this._isLoaded) {
            return;
        }
        this._isLoaded = true;
        var title = this._createTitle();
        this._listView.removeAllChildren();
        this._listView.pushBackCustomItem(title);
        this._buildDes(1);
        this._buildDes(2);
        this._buildDes(3);
        this._buildDes(4);
        // this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        this._listView.node.setContentSize(contentSize);
        this.node.setContentSize(contentSize);
    }

    onEnter() {

    }
    _createTitle() {
        var item = cc.instantiate(this._titleNode);
        var title = item.getChildByName("title").getComponent(CommonDetailTitleWithBg) as CommonDetailTitleWithBg;
        title.setFontSize(24);
        title.setTitle(Lang.get('instrument_detail_title_feature'));
        return item;
    }
    _buildDes(type) {
        var baseId = this._instrumentData.getBase_id();
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId);
        var unlockLevel = 0;
        if (type == 1) {
            unlockLevel = param.unlock;
        } else if (type == 2) {
            unlockLevel = param.cfg.unlock_1;
        } else if (type == 3) {
            unlockLevel = param.cfg.unlock_2;
        } else if (type == 4) {
            unlockLevel = param.cfg.unlock_3;
        }
        if (unlockLevel == 0) {
            return null;
        }
        var node = cc.instantiate(this._featureNode);;
        var panelBg = node.getChildByName('PanelBg');
        var textName = panelBg.getChildByName('TextName').getComponent(cc.Label);
        var textUnlock = panelBg.getChildByName('TextUnlock').getComponent(cc.Label);
        var nameDes = Lang.get('instrument_detail_feature_level_title', { level: unlockLevel });
        textName.string = (nameDes);
        (textName as any)._updateRenderData(true);
        textUnlock.string = (Lang.get('instrument_detail_advance_unlock2', { level: unlockLevel }));
        var size = textName.node.getContentSize();
        var posX = textName.node.x + size.width + 5;
        textUnlock.node.x = posX;
        var level = this._instrumentData.getLevel();
        var isUnlock = level >= unlockLevel;
        textUnlock.node.active = (!isUnlock);
        var size = panelBg.getContentSize();
        node.setContentSize(size);
        this._listView.pushBackCustomItem(node);
        var description: string = '';
        if (G_UserData.getBase().isEquipAvatar() && this._instrumentData.getPos() == 1) {
            var avatarId = G_UserData.getBase().getAvatar_base_id();
            var heroId = AvatarDataHelper.getAvatarConfig(avatarId).hero_id;
            if (type == 1) {
                description = AvatarDataHelper.getAvatarMappingConfig(heroId).description;
            } else if (type == 2) {
                description = AvatarDataHelper.getAvatarMappingConfig(heroId).description_1;
            } else if (type == 3) {
                description = AvatarDataHelper.getAvatarMappingConfig(heroId).description_2;
            } else if (type == 4) {
                description = AvatarDataHelper.getAvatarMappingConfig(heroId).description_3;
            }
        } else {
            if (type == 1) {
                description = param.description;
            } else if (type == 2) {
                description = param.cfg.description_1;
            } else if (type == 3) {
                description = param.cfg.description_2;
            } else if (type == 4) {
                description = param.cfg.description_3;
            }
        }
        var textDesNode = cc.instantiate(this._textDesNode);
        var textDes = textDesNode.getChildByName("textDes");
        var desColor = isUnlock && Colors.SYSTEM_TARGET_RED || Colors.BRIGHT_BG_TWO;
        textDes.color = (desColor);
        var textLabel = textDes.getComponent(cc.Label);
        textLabel.string = description;
        //(textLabel as any)._updateRenderData(true);

        this._listView.pushBackCustomItem(textDesNode);
    }
}
