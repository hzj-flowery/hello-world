const {ccclass, property} = cc._decorator;

import CommonAttrNode from '../../../ui/component/CommonAttrNode'

import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Lang } from '../../../lang/Lang';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { TextHelper } from '../../../utils/TextHelper';
import { CommonDetailModule } from '../../../ui/component/CommonDetailModule';

@ccclass
export default class AvatarDetailBaseAttrModule extends ListViewCellBase implements CommonDetailModule{


   @property({
       type: cc.Sprite,
       visible: true
   })
   _panelBg: cc.Sprite = null;

   @property({
       type: CommonDetailTitleWithBg,
       visible: true
   })
   _nodeTitle: CommonDetailTitleWithBg = null;

   @property({
       type: CommonAttrNode,
       visible: true
   })
   _nodeBaseAttr1: CommonAttrNode = null;

   @property({
       type: CommonAttrNode,
       visible: true
   })
   _nodeBaseAttr2: CommonAttrNode = null;

    public static path:string = 'avatar/AvatarDetailBaseAttrModule';

    private _data:any;

    create() {
        var contentSize = this._panelBg.node.getContentSize();
        this.node.setContentSize(contentSize);
        //this._panelBg.setSwallowTouches(false);
        this._nodeTitle.setFontSize(24);
        this._nodeTitle.setTitle(Lang.get('avatar_detail_base_attr_title'));
    }
    updateUI(data) {
        this._data = data;
    }
    enter(){
        var baseAttr = AvatarDataHelper.getAvatarBaseAttr(this._data.getBase_id());
        var baseAttrDes = TextHelper.getAttrInfoBySort(baseAttr);
        for (var i=1; i<=2; i++) {
            var info = baseAttrDes[i-1];
            if (info) {
                this['_nodeBaseAttr' + i].setVisible(true);
                this['_nodeBaseAttr' + i].updateView(info.id, info.value, null, 4);
            } else {
                this['_nodeBaseAttr' + i].setVisible(false);
            }
        }
    }

    numberOfCell(): number {
        return 1;
    }
    cellAtIndex(i: number): cc.Node {
        this.create();
        this.enter();
        return this.node;
    }
}
