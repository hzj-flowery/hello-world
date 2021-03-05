const {ccclass, property} = cc._decorator;

import CommonButtonLevel2Highlight from '../../../ui/component/CommonButtonLevel2Highlight'

import CommonAttrNode from '../../../ui/component/CommonAttrNode'

import CommonDesValue from '../../../ui/component/CommonDesValue'

import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'
import { Lang } from '../../../lang/Lang';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { TextHelper } from '../../../utils/TextHelper';
import { G_UserData, G_SceneManager } from '../../../init';

@ccclass
export default class AvatarDetailAttrModule extends cc.Component {

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
       type: CommonDesValue,
       visible: true
   })
   _nodeLevel: CommonDesValue = null;

   @property({
       type: CommonAttrNode,
       visible: true
   })
   _nodeAttr1: CommonAttrNode = null;

   @property({
       type: CommonAttrNode,
       visible: true
   })
   _nodeAttr2: CommonAttrNode = null;

   @property({
       type: CommonAttrNode,
       visible: true
   })
   _nodeAttr3: CommonAttrNode = null;

   @property({
       type: CommonAttrNode,
       visible: true
   })
   _nodeAttr4: CommonAttrNode = null;

   @property({
       type: CommonButtonLevel2Highlight,
       visible: true
   })
   _buttonStr: CommonButtonLevel2Highlight = null;

   private _data:any;


   onCreate() {
    var contentSize = this._panelBg.getContentSize();
    this.node.setContentSize(contentSize);
    // this._panelBg.setSwallowTouches(false);
    this._nodeTitle.setFontSize(24);
    this._nodeTitle.setTitle(Lang.get('avatar_detail_attr_title'));
    this._nodeLevel.setFontSize(20);
    this._buttonStr.setString(Lang.get('avatar_detail_btn_str'));
}
updateUI(data) {
    this._data = data;
    // var level = data.getLevel();
    // var templet = data.getConfig().levelup_cost;
    // this._nodeLevel.updateUI(Lang.get('avatar_detail_txt_level'), level);
    // var levelAttr = AvatarDataHelper.getAvatarLevelAttr(level, templet);
    // var levelAttrDes = TextHelper.getAttrInfoBySort(levelAttr);
    // for (var i = 1; i <= 4; i++) {
    //     var info = levelAttrDes[i];
    //     if (info) {
    //         this['_nodeAttr' + i].setVisible(true);
    //         this['_nodeAttr' + i].updateView(info.id, info.value, null, 4);
    //     } else {
    //         this['_nodeAttr' + i].setVisible(false);
    //     }
    // }
    // var isHave = G_UserData.getAvatar().isHaveWithBaseId(data.getBase_id());
    // this._buttonStr.setEnabled(isHave);
    // var redValue = AvatarDataHelper.isPromptTrain();
    // this._buttonStr.showRedPoint(isHave && redValue);
}
_onButtonStrClicked() {
    G_SceneManager.showScene('avatarTrain', this._data.getId(), true);
}

}