const {ccclass, property} = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import CommonListItem from '../../../ui/component/CommonListItem';
import { CustomActivityConst } from '../../../const/CustomActivityConst';
import { table } from '../../../utils/table';
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import EffectGfxNode from '../../../effect/EffectGfxNode';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';

@ccclass
export default class CustomActivityWeekFundsCell extends CommonListItem {

   @property({
       type: cc.Node,
       visible: true
   })
   _resource: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageRightFlag: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageLeftFlag: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _item1: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageSelected1: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageDay1: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDay1: cc.Label = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _fileNodeIcon1: CommonIconTemplate = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect1: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName1: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageShade1: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageGot1: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch1: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _item2: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageSelected2: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageDay2: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDay2: cc.Label = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _fileNodeIcon2: CommonIconTemplate = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect2: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName2: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageShade2: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageGot2: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch2: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _item3: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageSelected3: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageDay3: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDay3: cc.Label = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _fileNodeIcon3: CommonIconTemplate = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect3: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName3: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageShade3: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageGot3: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch3: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _item4: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageSelected4: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageDay4: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDay4: cc.Label = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _fileNodeIcon4: CommonIconTemplate = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect4: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName4: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageShade4: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageGot4: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch4: cc.Node = null;

   onCreate() {
    this.node.setContentSize(this._resource.getContentSize());
    for (var index = 1; index <= CustomActivityConst.FUNDS_WEEKITEMNUM_MAX; index++) {
        this['_item' + index].node.active = (false);
    }
}
_onPanelTouch(sender, state) {
        var moveOffsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        var moveOffsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            var day = sender.getTag();
            this.dispatchCustomCallback(day);
        }
}
_updateEffect(index, state) {
    var selectedFlash = this['_nodeEffect' + index].getChildByName('flash_effect' + index);
    if (selectedFlash == null) {
        var lightEffect = new EffectGfxNode().setEffectName(SeasonSportConst.SEASON_PET_SELECTEDEFFECT[1]);
        lightEffect.node.setAnchorPoint(0, 0);
        lightEffect.play();
        lightEffect.node.setScale(1.1);
        lightEffect.node.active = (state == 0);
        lightEffect.name = ('flash_effect' + index);
        (this['_nodeEffect' + index] as cc.Node).addChild(lightEffect.node);
        lightEffect.node.setPosition(this['_nodeEffect' + index].getContentSize().width * 0.5, this['_nodeEffect' + index].getContentSize().height * 0.5 + 1);
    } else {
        selectedFlash.node.active = (state == 0);
    }
}
updateUIData(cellData, fundsType, bFirstCell) {
    for (var index = 1; index <= CustomActivityConst.FUNDS_WEEKITEMNUM_MAX; index++) {
        this['_item' + index].node.active = (false);
    }
    if (cellData == null || table.nums(cellData) <= 0) {
        return;
    }
    var bExistSunday = false;
    if (fundsType == CustomActivityConst.FUNDS_TYPE_WEEK && CustomActivityConst.FUNDS_WEEKITEMNUM_SPECIAL == table.nums(cellData)) {
        bExistSunday = true;
    }
    var updateItem = function (index, data, bSunday) {
        if (bSunday && index == CustomActivityConst.FUNDS_WEEKITEMNUM_SPECIAL) {
            index = CustomActivityConst.FUNDS_WEEKITEMNUM_MAX;
        }
        this['_item' + index].node.active = (true);
        this['_textDay' + index].setString(Lang.get('weekfunds_' + data.day));
        this['_fileNodeIcon' + index].unInitUI();
        this['_fileNodeIcon' + index].initUI(data.reward_type_1, data.reward_value_1, data.reward_size_1);
        if (data.isActived && data.canSignedDay) {
            this._updateEffect(index, data.canGet);
            this['_fileNodeIcon' + index].setIconMask(data.canGet == 1);
            this['_fileNodeIcon' + index].setTouchEnabled(data.canGet == 1);
            this['_imageSelected' + index].node.active = (data.canGet == 0);
            this['_imageGot' + index].node.active = (data.canGet == 1);
            this['_imageShade' + index].node.active = (data.canGet == 1);
            this['_imageDay' + index].node.active = (data.canGet == 0);
            this['_textDay' + index].node.active = (data.canGet == 0);
            this['_panelTouch' + index].node.active = (data.canGet == 0);
        } else {
            this._updateEffect(index, 1);
            this['_fileNodeIcon' + index].setIconMask(false);
            this['_fileNodeIcon' + index].setTouchEnabled(true);
            this['_imageSelected' + index].node.active = (false);
            this['_imageGot' + index].node.active = (false);
            this['_imageShade' + index].node.active = (false);
            this['_imageDay' + index].node.active = (true);
            this['_textDay' + index].node.active = (true);
            this['_panelTouch' + index].node.active = (false);
        }
        var param = this['_fileNodeIcon' + index].getItemParams();
        this['_textName' + index].setString(param.name);
        this['_textName' + index].setColor(param.icon_color);
        this['_panelTouch' + index].setTag(data.day);
        this['_panelTouch' + index].setEnabled(true);
        this['_panelTouch' + index].setSwallowTouches(false);
        this['_panelTouch' + index].setTouchEnabled(true);
        this['_panelTouch' + index].addClickEventListenerEx(handler(this, this._onPanelTouch));
    }.bind(this);
    for (var index = 1; index <= cellData.length; index++) {
        updateItem(index, cellData[index], bExistSunday);
    }
}


}