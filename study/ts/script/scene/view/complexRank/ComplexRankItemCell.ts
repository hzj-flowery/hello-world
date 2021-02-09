const { ccclass, property } = cc._decorator;

import CommonPlayerName from '../../../ui/component/CommonPlayerName'

import CommonHeadFrame from '../../../ui/component/CommonHeadFrame'

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import { TextHelper } from '../../../utils/TextHelper';
import { ComplexRankConst } from '../../../const/ComplexRankConst';
import CommonListItem from '../../../ui/component/CommonListItem';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { PopupHonorTitleHelper } from '../playerDetail/PopupHonorTitleHelper';
import { G_UserData, Colors } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { Path } from '../../../utils/Path';
import { Util } from '../../../utils/Util';
import CommonUI from '../../../ui/component/CommonUI';
import { handler } from '../../../utils/handler';

@ccclass
export default class ComplexRankItemCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodePlayerIcon: CommonHeroIcon = null;

    @property({
        type: CommonHeadFrame,
        visible: true
    })
    _commonHeadFrame: CommonHeadFrame = null;

    @property({
        type: CommonPlayerName,
        visible: true
    })
    _fileNodePlayer: CommonPlayerName = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_power: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_level: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_normal: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_group: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_star: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_tower: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_bk: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_bk_bg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_rank_bk: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_Rank_num: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_rank_num: cc.Label = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _node_title: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _rankNum: cc.Label = null;
    private _cellValue: any;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);

        this._resourceNode.on(cc.Node.EventType.TOUCH_END, this._onPanelClick, this);
    }
    onEnter(): void {

    }
    updateUI(index, data) {
        this._node_power.active = (false);
        this._node_level.active = (false);
        this._node_normal.active = (false);
        this._node_group.active = (false);
        this._node_star.active = (false);
        this._node_tower.active = (false);

        this.updateUIData(index, data[0], data[1])
    }
    updateUIData(index, data, rankType) {
        this._cellValue = data;
        if (data == null) {
            return;
        }
        if (rankType != ComplexRankConst.USER_GUILD_RANK) {
            this._fileNodePlayerIcon.updateIcon(data.playerHeadInfo, null, data.head_frame_id);
            var outscale = cc.v2();
            this._fileNodePlayerIcon.node.getScale(outscale);
            this._commonHeadFrame.updateUI(data.head_frame_id, outscale);
            if (!this._commonHeadFrame._isClickFrame)
                this._commonHeadFrame.setCallBack(handler(this, this._onPanelClick))
        }
        this.updateRankType(rankType, data);
        var node_title = this._node_title;
        if (data.titleId && data.titleId > 0) {
            UserDataHelper.appendNodeTitle(node_title, data.titleId, "ComplexRankItemCell");
            node_title.active = (true);
            var posx = this._fileNodePlayer.node.x;
            var width = this._fileNodePlayer.getWidth();
            var size = PopupHonorTitleHelper.getTitleSize(data.titleId);
            node_title.x = (posx + width + size.width * 0.5 - 15);
        } else {
            node_title.active = (false);
        }
        if (data.rank <= 3 && data.rank > 0) {
            // Util.updateImageView(this._image_bk, {
            //     visible: true,
            //     texture: Path.getComplexRankUI('img_large_ranking0' + data.rank)
            // });
            this._image_bk.node.active = true;
            this._image_bk.node.addComponent(CommonUI).loadTexture(Path.getComplexRankUI('img_large_ranking0' + data.rank));
            Util.updateImageView(this._image_bk_bg, { visible: true });
            Util.updateImageView(this._image_rank_bk, Path.getComplexRankUI('icon_ranking0' + data.rank));
            Util.updateImageView(this._image_Rank_num, {
                visible: true,
                texture: Path.getComplexRankUI('txt_ranking0' + data.rank)
            });
            Util.updateLabel(this._text_rank_num, { visible: false });
            this._rankNum.node.active = false;
        } else {
            Util.updateImageView(this._image_Rank_num, { visible: false });
            this._rankNum.node.active = true;
            this._rankNum.string = data.rank;
            Util.updateLabel(this._text_rank_num, {
                visible: true,
                text: data.rank
            });
            Util.updateImageView(this._image_rank_bk, Path.getComplexRankUI('icon_ranking04'));
            Util.updateImageView(this._image_bk_bg, { visible: false });
            if (data.rank >= 4 && data.rank % 2 == 1) {
                // Util.updateImageView(this._image_bk, {
                //     visible: true,
                //     texture: Path.getCommonRankUI('img_com_board_list01a')
                // });
                this._image_bk.node.active = true;
                this._image_bk.node.addComponent(CommonUI).loadTexture(Path.getCommonRankUI('img_com_board_list01a'));
            } else if (data.rank >= 4 && data.rank % 2 == 0) {
                // Util.updateImageView(this._image_bk, {
                //     visible: true,
                //     texture: Path.getCommonRankUI('img_com_board_list01b')
                // });
                this._image_bk.node.active = true;
                this._image_bk.node.addComponent(CommonUI).loadTexture(Path.getCommonRankUI('img_com_board_list01b'));
            }
        }
    }
    updateRankType(rankType, data) {
        if (rankType == ComplexRankConst.USER_GUILD_RANK) {
            var node = this._node_group;
            node.active = (true);
            Util.updateLabel(node.getChildByName('Text_guildName').getComponent(cc.Label), data.guildName);
            Util.updateLabel(node.getChildByName('Text_guild_num').getComponent(cc.Label), data.memberCount);
            Util.updateLabel(node.getChildByName('Text_guild_player').getComponent(cc.Label), {
                text: data.leaderName,
                color: Colors.getOfficialColor(data.leaderOfficialLv),
                outlineColor: Colors.getOfficialColorOutlineEx(data.leaderOfficialLv)
            });
            var node = this._node_level;
            node.active = (true);
            Util.updateLabel(node.getChildByName('Text_bmp_text').getComponent(cc.Label), data.level);
            this._fileNodePlayerIcon.node.active = (false);
            this._commonHeadFrame.node.active = (false);
        } else {
            var node = this._node_normal;
            this._fileNodePlayer.updateUI(data.name, data.officialLv);
            this._fileNodePlayer.setFontSize(22);
            Util.updateLabel(node.getChildByName('Text_guildName').getComponent(cc.Label), data.guildName);
            node.active = (true);
        }
        if (rankType == ComplexRankConst.STAGE_STAR_RANK || rankType == ComplexRankConst.ELITE_STAR_RANK) {
            var node = this._node_star;
            node.active = (true);
            Util.updateLabel(node.getChildByName('Text_bmp_text').getComponent(cc.Label), TextHelper.getAmountText(data.star));
            return;
        }
        if (rankType == ComplexRankConst.TOWER_STAR_RANK) {
            var node = this._node_tower;
            node.active = (true);
            Util.updateLabel(node.getChildByName('Text_bmp_text').getComponent(cc.Label), TextHelper.getAmountText(data.star));
            return;
        }
        if (rankType == ComplexRankConst.USER_POEWR_RANK) {
            var node = this._node_power;
            node.active = (true);
            Util.updateLabel(node.getChildByName('Text_bmp_text').getComponent(cc.Label), TextHelper.getAmountText(data.power));
            return;
        }
        if (rankType == ComplexRankConst.USER_LEVEL_RANK) {
            var node = this._node_level;
            node.active = (true);
            Util.updateLabel(node.getChildByName('Text_bmp_text').getComponent(cc.Label), data.level);
            return;
        }
        if (rankType == ComplexRankConst.USER_ARENA_RANK) {
            var node = this._node_power;
            node.active = (true);
            Util.updateLabel(node.getChildByName('Text_bmp_text').getComponent(cc.Label), TextHelper.getAmountText(data.power));
            return;
        }
        if (rankType == ComplexRankConst.ACTIVE_PHOTO_RANK) {
            var node = this._node_power;
            node.active = (true);
            Util.updateLabel(node.getChildByName('Image_name').getComponent(cc.Label), Lang.get('complex_rank_arrage_des5'));
            Util.updateLabel(node.getChildByName('Text_bmp_text').getComponent(cc.Label), data.photo_count);
        }
        if (rankType == ComplexRankConst.AVATAR_PHOTO_RANK) {
            var node = this._node_power;
            node.active = true;
            Util.updateLabel(node.getChildByName('Image_name').getComponent(cc.Label), Lang.get('complex_rank_arrage_des5'));
            Util.updateLabel(node.getChildByName('Text_bmp_text').getComponent(cc.Label), data.avaterNum);
        }
    }
    _onPanelClick(iconNameNode) {
        cc.log(iconNameNode);
        var curSelectedPos = this.itemID;
        cc.warn(' ComplexRankItemCell:_onBtnClick  ' + curSelectedPos);
        if (this._cellValue == null) {
            return;
        }
        if (this._cellValue.userId == G_UserData.getBase().getId()) {
            return;
        }
        this.dispatchCustomCallback(curSelectedPos);
    }


}