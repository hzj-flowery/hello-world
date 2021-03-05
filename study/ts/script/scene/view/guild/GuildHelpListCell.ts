const { ccclass, property } = cc._decorator;

import CommonResourceInfoList from '../../../ui/component/CommonResourceInfoList'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonProgressNode from '../../../ui/component/CommonProgressNode'

import CommonFragmentIcon from '../../../ui/component/CommonFragmentIcon'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { Lang } from '../../../lang/Lang';
import { DataConst } from '../../../const/DataConst';
import CommonListItem from '../../../ui/component/CommonListItem';

@ccclass
export default class GuildHelpListCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel1: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPosition1: cc.Label = null;

    @property({
        type: CommonFragmentIcon,
        visible: true
    })
    _fileNodeIcon1: CommonFragmentIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFragName1: cc.Label = null;

    @property({
        type: CommonProgressNode,
        visible: true
    })
    _commonProgressBar1: CommonProgressNode = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHaveFragCount1: cc.Label = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonHelp1: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _commonResInfo1: CommonResourceInfoList = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel2: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPosition2: cc.Label = null;

    @property({
        type: CommonFragmentIcon,
        visible: true
    })
    _fileNodeIcon2: CommonFragmentIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFragName2: cc.Label = null;

    @property({
        type: CommonProgressNode,
        visible: true
    })
    _commonProgressBar2: CommonProgressNode = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHaveFragCount2: cc.Label = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonHelp2: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _commonResInfo2: CommonResourceInfoList = null;
    _fragmentId: any[];

    public static readonly LINE_ITEM_NUM = 2;
    public static readonly MAX_FRAGMENT = 5;

    onCreate() {
        this._fragmentId = [];
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(itemId, datas) {
        this._updateItem(1, datas[0]);
        this._updateItem(2, datas[1]);
    }
    _updateItem(index, data) {
        if (!data) {
            this['_panel' + index].active = (false);
            return;
        }
        this['_panel' + index].active = (true);
        var memberData = data.getMember();
        var helpBaseData = data.getHelp_base();
        var name = memberData.getName();
        var official = memberData.getOfficer_level();
        var [officialName,officialColor] = UserDataHelper.getOfficialInfo(official);
        var position = memberData.getPosition();
        var duties = UserDataHelper.getGuildDutiesName(position);
        var fragmentId = helpBaseData.getHelp_id();
        var fragmentParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragmentId);
        var fragName = fragmentParam.name;
        var limitMax = helpBaseData.getLimit_max();
        var alreadyHelp = helpBaseData.getAlready_help();
        var percent = Math.ceil(alreadyHelp / limitMax * 100);
        var fragCount = alreadyHelp + ('/' + limitMax);
        this['_textName' + index].getComponent(cc.Label).string = (name);
        this['_textPosition' + index].getComponent(cc.Label).string = (duties);
        this['_fileNodeIcon' + index].getComponent(CommonFragmentIcon).updateUI(fragmentId);
        this['_textFragName' + index].getComponent(cc.Label).string = (fragName);
        var itemParams = this['_fileNodeIcon' + index].getComponent(CommonFragmentIcon).getItemParams();
        this['_textFragName' + index].color = (itemParams.icon_color);
        // this['_commonProgressBar' + index].getComponent(CommonProgressNode)._init();
        this['_commonProgressBar' + index].getComponent(CommonProgressNode).setPercent(alreadyHelp, limitMax);
        this['_commonProgressBar' + index].getComponent(CommonProgressNode).showDivider(true, GuildHelpListCell.MAX_FRAGMENT, alreadyHelp, limitMax);
        this._fragmentId[index] = fragmentId;
        var gold = UserDataHelper.getGuildHelpNeedGold();
        this.updateBtnState(index, gold);
    }
    updateBtnState(index, gold) {
        if (!this['_panel' + index].active) {
            return;
        }
        var showCostGold = gold && gold > 0;
        this['_buttonHelp' + index].getComponent(CommonButtonLevel1Highlight).setString(showCostGold ? '' : Lang.get('guild_help_btn'));
        this['_buttonHelp' + index].getComponent(CommonButtonLevel1Highlight).setEnabled(true);
        this['_commonResInfo' + index].getComponent(CommonResourceInfoList).setVisible(showCostGold);
        if (showCostGold) {
            this['_commonResInfo' + index].getComponent(CommonResourceInfoList).updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, gold);
            this['_commonResInfo' + index].getComponent(CommonResourceInfoList).setCountColorToBtnLevel1Bright();
            this['_commonResInfo' + index].getComponent(CommonResourceInfoList).setFontSize(22);
        }
    }
    onButtonHelpClicked1() {
        this.dispatchCustomCallback(0, this._fragmentId[1]);
    }
    onButtonHelpClicked2() {
        this.dispatchCustomCallback(1, this._fragmentId[2]);
    }

}