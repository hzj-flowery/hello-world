const { ccclass, property } = cc._decorator;
import InstrumentConst from "../../../const/InstrumentConst";
import { Colors, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { CommonDetailModule } from "../../../ui/component/CommonDetailModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";

@ccclass
export default class AvatarDetailInstrumentFeatureModule extends ListViewCellBase implements CommonDetailModule {

    @property({
        type: cc.Node,
        visible: true
    })
    _newlistView: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _featureNode: cc.Node = null;


    private _data: any;
    private _instrumentData: any;
    updateUI(data, isLock?) {
        this._data = data;

        var instrumentId = G_UserData.getBattleResource().getResourceId(1, InstrumentConst.FLAG, 1);
        if (instrumentId == null) {
            var roleBaseId = G_UserData.getHero().getRoleBaseId();
            var instrumentBaseId = HeroDataHelper.getHeroConfig(roleBaseId).instrument_id;
            this._instrumentData = G_UserData.getInstrument().createTempInstrumentUnitData({ baseId: instrumentBaseId });
        } else {
            this._instrumentData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
        }
    }
    // onCreate() {

    //     this._newlistView.removeAllChildren();
    //     var title = this._createTitle();
    //     this._newlistView.addChild(title)
    //     this._buildDes(2);
    //     this._buildDes(1);
    // }
    _createTitle() {
        var node = cc.resources.get(Path.getCommonPrefab("CommonDetailTitleWithBg"))
        var item = cc.instantiate(node) as cc.Node;
        var title = item.getComponent(CommonDetailTitleWithBg) as CommonDetailTitleWithBg;
        title.setFontSize(24);
        title.setTitle(Lang.get('instrument_detail_title_feature'));

        var widget = new cc.Node();
        var titleSize = cc.size(402, 50)
        widget.setContentSize(titleSize)
        title.node.setPosition(titleSize.width / 2, 0)
        widget.addChild(title.node)


        return widget;
    }
    _buildDes(type) {
        var mainWiget = new cc.Node();
        mainWiget.setAnchorPoint(0, 0)
        var baseId = this._instrumentData.getBase_id();
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId);
        var unlockLevel = 0;
        if (type == 1) {
            unlockLevel = param.unlock;
        } else if (type == 2) {
            unlockLevel = param.cfg.unlock_1;
        } else if (type == 3) {
            unlockLevel = param.cfg.unlock_2;
        }
        if (unlockLevel == 0) {
            return null;
        }

        var level = this._instrumentData.getLevel();
        var isUnlock = level >= unlockLevel;

        var description = '';
        var avatarId = this._data.getBase_id();
        var heroId = AvatarDataHelper.getAvatarConfig(avatarId).hero_id;
        if (type == 1) {
            description = AvatarDataHelper.getAvatarMappingConfig(heroId).description;
        } else if (type == 2) {
            description = AvatarDataHelper.getAvatarMappingConfig(heroId).description_1;
        }

        // var textDes = UIHelper.createWithTTF(description, Path.getCommonFont(), 20);
        var textDes = UIHelper.createLabel({ fontSize: 20 }).getComponent(cc.Label);
        // textDes.fontFamily = Path.getCommonFont();
        textDes.string = description
        textDes.node.setAnchorPoint(new cc.Vec2(0, 1));
        textDes.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        textDes.node.width = (354);
        var desColor = isUnlock && Colors.SYSTEM_TARGET_RED || Colors.BRIGHT_BG_TWO;
        textDes.node.color = (desColor);
        //var widget1 = new cc.Node();
       // var widget2 = new cc.Node();


        textDes["_updateRenderData"](true);
        var height = textDes.node.getContentSize().height;
        textDes.node.setPosition(new cc.Vec2(24, height + 15));
        mainWiget.addChild(textDes.node);
        var size1 = cc.size(402, height + 20);
        //widget2.setContentSize(size);


        var featureNode = cc.instantiate(this._featureNode);
        featureNode.active = true;
        mainWiget.addChild(featureNode);
        var panelBg = featureNode;
        var textName = panelBg.getChildByName('TextName').getComponent(cc.Label);
        var textUnlock = panelBg.getChildByName('TextUnlock').getComponent(cc.Label);
        var nameDes = Lang.get('instrument_detail_feature_level_title', { level: unlockLevel });
        textName.string = (nameDes);
        textName["_updateRenderData"](true);
        textUnlock.string = (Lang.get('instrument_detail_advance_unlock2', { level: unlockLevel }));
        textUnlock["_updateRenderData"](true);
        var size = textName.node.getContentSize();
        var posX = textName.node.x + size.width;
        textUnlock.node.x = (posX);
      
        textUnlock.node.active = (!isUnlock);

        var size2 = panelBg.getContentSize();
        size2.height = size2.height + 15;
        featureNode.y = size1.height;
        //widget1.setContentSize(size);
      //  mainWiget.addChild(widget1);
        //widget1.y = widget2.height;
        //mainWiget.addChild(widget2);
        mainWiget.setContentSize(402, size1.height + size2.height);
        return mainWiget;
    }

    numberOfCell(): number {
        return 3;
    }
    cellAtIndex(i: number): cc.Node {
        if (i == 0) {
            return this._createTitle();
        } else {
            return this._buildDes(i);
        }
    }
    sectionView(): cc.Node {
        return this._newlistView;
    }
}
