const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Lang } from '../../../lang/Lang';
import { DataConst } from '../../../const/DataConst';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { G_UserData } from '../../../init';
import { GuildDataHelper } from '../../../utils/data/GuildDataHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';

@ccclass
export default class GuildContributionItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textContributionName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageContributionType: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageReceive: cc.Sprite = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonOk: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resInfo: CommonResourceInfo = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _item01: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _item02: CommonIconTemplate = null;

    public static readonly BG_IMGS = {
        1: 'img_jisi01',
        2: 'img_jisi02',
        3: 'img_jisi03'
    };
    public static readonly TITLE_IMGS = {
        1: 'txt_juntuanjisi01',
        2: 'txt_juntuanjisi02',
        3: 'txt_juntuanjisi03'
    };


    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._buttonOk.setString(Lang.get('guild_contribution_btn_name'));
        this._buttonOk.setSwallowTouches(false);
    }
    updateData(config) {
        var remainCount = GuildDataHelper.getGuildContributionRemainCount();
        var userGuildInfo = G_UserData.getGuild().getUserGuildInfo();
        var index = config.id;
        var isContribution = userGuildInfo.getDonate() == config.id;
        var canContribution = remainCount > 0;
        var contribution = config.contribution;
        var exp = config.exp;
        this._resInfo.updateUI(config.cost_type, config.cost_value, config.cost_size);
        this._item01.unInitUI();
        this._item01.initUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GUILD_EXP, exp);
        this._item01.showCount(true);
        this._item01.setImageTemplateVisible(true);
        this._item02.unInitUI();
        this._item02.initUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GONGXIAN, contribution);
        this._item02.showCount(true);
        this._item02.setImageTemplateVisible(true);
        UIHelper.loadTexture(this._imageBg, Path.getGuildRes(GuildContributionItemCell.BG_IMGS[index]))
        UIHelper.loadTexture(this._imageContributionType, Path.getTextGuild(GuildContributionItemCell.TITLE_IMGS[index]))
        this._textContributionName.string = (Lang.get('guild_contribution_title_names')[index - 1]);
        this._imageReceive.node.active = (isContribution);
        this._buttonOk.setVisible(!isContribution);
        this._buttonOk.setEnabled(canContribution);
    }
    onButton() {
        this.dispatchCustomCallback(null);
    }
}