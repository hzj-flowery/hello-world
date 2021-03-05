const {ccclass, property} = cc._decorator;
import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Lang } from "../../../lang/Lang";
import { HorseDataHelper } from "../../../utils/data/HorseDataHelper";
import { Colors, G_UserData } from "../../../init";

@ccclass
export default class HorseDetailRideNode extends CommonDetailDynamicModule {
    @property({
        type: cc.Node,
        visible: true
    })
    _textDesNode:cc.Node = null;

    @property(cc.Prefab)
    detailTitleWithBg:cc.Prefab = null;

    private _data:any;

    ctor(data) {
        this._data = data;
        this.onInit();
    }
    onInit() {
        var title = this._createTitle();
        this._listView.pushBackCustomItem(title);
        var des = this._createDes();
        this._listView.pushBackCustomItem(des);
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        this._listView.setContentSize(contentSize);
        this.node.setContentSize(contentSize);
    }
    _createTitle() {
        var title = cc.instantiate(this.detailTitleWithBg).getComponent(CommonDetailTitleWithBg);
        title.setFontSize(24);
        title.setTitle(Lang.get('horse_detail_title_ride'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 50);
        widget.setContentSize(titleSize);
        title.node.setPosition(titleSize.width / 2, 30);
        widget.addChild(title.node);
        return widget;
    }
    _createDes() {
        var rideDes = '';
        var [heroIds, isSuitAll] = G_UserData.getHorse().getHeroIdsWithHorseId(this._data.getBase_id());
        if (isSuitAll) {
            rideDes = Lang.get('horse_suit_ride_all');
        } else {
            var strNames = '';
            var names = HorseDataHelper.getHeroNameByFilter(heroIds);
            for (var i=1; i<= names.length; i++) {
                var name = names[i-1];
                strNames = strNames + name;
                if (i != names.length) {
                    strNames = strNames + '\u3001';
                }
            }
            rideDes = Lang.get('horse_suit_ride_heros', { heroNames: strNames });
        }
        var color = Colors.BRIGHT_BG_TWO;
        var textDesNode = cc.instantiate(this._textDesNode);
        var textDes = textDesNode.getChildByName("textDes");
        textDes.color = color;
        var textLabel = textDes.getComponent(cc.Label);
        textLabel.string = rideDes;
        var height = Math.ceil(rideDes.length / 17+1)*26;;
        textLabel.node.height = height;
        textDesNode.height = height;
        return textDesNode;
    }
}
