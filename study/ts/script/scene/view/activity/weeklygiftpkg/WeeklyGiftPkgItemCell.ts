const {ccclass, property} = cc._decorator;

import { DataConst } from '../../../../const/DataConst';
import { RichTextExtend } from '../../../../extends/RichTextExtend';
import { Lang } from '../../../../lang/Lang';
import CommonButtonLevel1Highlight from '../../../../ui/component/CommonButtonLevel1Highlight';
import CommonIconTemplate from '../../../../ui/component/CommonIconTemplate';
import CommonPriceDiscountInfo3 from '../../../../ui/component/CommonPriceDiscountInfo3';
import CommonPriceShowInfo3 from '../../../../ui/component/CommonPriceShowInfo3';
import CommonVipNode from '../../../../ui/component/CommonVipNode';
import ListViewCellBase from '../../../../ui/ListViewCellBase';
import { UserDataHelper } from '../../../../utils/data/UserDataHelper';
import { Path } from '../../../../utils/Path';
import { TypeConvertHelper } from '../../../../utils/TypeConvertHelper';
import UIHelper from '../../../../utils/UIHelper';





@ccclass
export default class WeeklyGiftPkgItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIconTemplate: CommonIconTemplate = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _commonButtonMediumNormal: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonPriceDiscountInfo3,
        visible: true
    })
    _textPrePrice: CommonPriceDiscountInfo3 = null;

    @property({
        type: CommonPriceShowInfo3,
        visible: true
    })
    _textNowPrice: CommonPriceShowInfo3 = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDiscount: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDiscountNum: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDiscount: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textItemName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCondition: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCondition: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageReceive: cc.Sprite = null;

    @property({
        type: CommonVipNode,
        visible: true
    })
    _textVip: CommonVipNode = null;

    @property({
        type:cc.Label,
        visible:true
    })
    _vipDes2:cc.Label = null;


    static DISCOUNT_IMGS = [
        '',
        '',
        '',
        'img_zhoulibao_si',
        'img_zhoulibao_wu',
        '',
        '',
        '',
        '',
        ''
    ];
    _conditionRichText: cc.Node;

    ctor() {
        UIHelper.addEventListener(this.node, this._commonButtonMediumNormal._button, 'WeeklyGiftPkgItemCell', '_onItemClick');
    }
    onInit(){
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    onCreate() {
        this.ctor();
        this._commonButtonMediumNormal.setString(Lang.get('lang_activity_weeklygiftpkg_btn'));
        this._commonButtonMediumNormal.setSwallowTouches(false);
    }
    _onItemClick(sender, state) {
        var curSelectedPos = this.getTag();
        //logWarn('WeeklyGiftPkgItemCell:_onIconClicked  ' + curSelectedPos);
        this.dispatchCustomCallback(curSelectedPos);
    }
    _createConditionRichText(richText) {
        if (this._conditionRichText) {
            this._conditionRichText.destroy();
        }
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(cc.v2(0, 0.5));
        this._nodeCondition.addChild(widget.node);
        this._conditionRichText = widget.node;
    }
    updateInfo(actWeeklyGiftPkgUnitData) {
        var cfg = actWeeklyGiftPkgUnitData.getConfig();
        var buyTime = actWeeklyGiftPkgUnitData.getRemainBuyTime();
        var enabled = buyTime > 0;
        var vipEnough = actWeeklyGiftPkgUnitData.checkVip();
        var hasDiscount = cfg.price_show > 0;
        this._commonIconTemplate.unInitUI();
        this._commonIconTemplate.initUI(cfg.type, cfg.value, cfg.size);
        this._commonIconTemplate.setTouchEnabled(true);
        this._commonIconTemplate.showCount(true);
        var itemParam = this._commonIconTemplate.getItemParams();
        this._textItemName.string = (cfg.name);
        this._textItemName.node.color = (itemParam.icon_color);
        this._textPrePrice.showDiscountLine(true);
        this._textPrePrice.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, cfg.price_show);
        this._textPrePrice.showResName(true, Lang.get('lang_activity_weeklygiftpkg_cell_old_price'));
        this._textNowPrice.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, cfg.price);
        this._textNowPrice.showResName(true, Lang.get('lang_activity_weeklygiftpkg_cell_now_price'));
        this._imageReceive.node.active = (!enabled);
        this._commonButtonMediumNormal.setVisible(enabled);
        var conditionStr = Lang.get('lang_activity_weeklygiftpkg_vip_condition', { value: cfg.vip });
        this._textVip.setString((cfg.vip).toString());
        if (cfg.vip >= 10) {
            this._vipDes2.node.x = (109);
        } else {
            this._vipDes2.node.x = (98);
        }
        if (hasDiscount) {
            var discount = UserDataHelper.calcDiscount(cfg.price_show, cfg.price);
            this._imageDiscount.node.active = (true);
            this._textDiscount.string = (Lang.get('lang_activity_weeklygiftpkg_dsicount', { discount: discount }));
            if (WeeklyGiftPkgItemCell.DISCOUNT_IMGS[Math.floor(discount)-1]) {
                var img = WeeklyGiftPkgItemCell.DISCOUNT_IMGS[Math.floor(discount)-1];
                UIHelper.loadTexture(this._imageDiscountNum, Path.getActivityTextRes(img));
            }
        } else {
            this._imageDiscount.node.active = (false);
        }
    }

}
