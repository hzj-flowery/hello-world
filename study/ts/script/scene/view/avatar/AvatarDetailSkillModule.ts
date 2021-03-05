const { ccclass, property } = cc._decorator;

import { Lang } from '../../../lang/Lang';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import AvatarDetailSkillCell from './AvatarDetailSkillCell';
import { CommonDetailModule } from '../../../ui/component/CommonDetailModule';

@ccclass
export default class AvatarDetailSkillModule extends ListViewCellBase implements CommonDetailModule {

    @property(cc.Prefab)
    commonDetailTitleWithBg: cc.Prefab = null;

    @property(cc.Prefab)
    avatarDetailSkillCell: cc.Prefab = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _list: cc.Node = null;


    public static path: string = 'avatar/AvatarDetailSkillModule';

    private _data: any;

    private _skillInfo: any[]

    updateUI(data) {
        this._data = data;
        this._skillInfo = AvatarDataHelper.getSkillInfo(this._data);
    }
    // onCreate() {

    //     var title = this._createTitle();
    //     this._list.addChild(title);
    //     var skillInfo = AvatarDataHelper.getSkillInfo(this._data);
    //     for (let i = skillInfo.length - 1; i >= 0; i--) {
    //         var info = skillInfo[i];
    //         var cell = cc.instantiate(this.avatarDetailSkillCell);
    //         var comp: AvatarDetailSkillCell = cell.getComponent(AvatarDetailSkillCell);
    //         comp.ctor(info);
    //         this._list.addChild(cell);
    //     }
    // }
    _createTitle() {
        var node = cc.instantiate(this.commonDetailTitleWithBg);
        var title = node.getComponent(CommonDetailTitleWithBg);
        title.setFontSize(24);
        title.setTitle(Lang.get('avatar_detail_skill_title'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 41);
        widget.setContentSize(titleSize);
        title.node.setPosition(titleSize.width / 2, titleSize.height / 2 - 20);
        widget.addChild(title.node);
        return widget;
    }

    numberOfCell(): number {
        return this._skillInfo.length + 1;
    }
    cellAtIndex(i: number): cc.Node {
        if (i == 0) {
            return this._createTitle();
        }else {
            var info = this._skillInfo[i -1];
            var cell = cc.instantiate(this.avatarDetailSkillCell);
            var comp: AvatarDetailSkillCell = cell.getComponent(AvatarDetailSkillCell);
            comp.ctor(info);
            return cell;
        }
    }
    sectionView(): cc.Node {
        return this._list;
    }

}
