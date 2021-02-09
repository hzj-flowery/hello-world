const { ccclass, property } = cc._decorator;

import ReplayVSNode from './ReplayVSNode'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { Path } from '../../../utils/Path';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';

@ccclass
export default class PopupReplays extends PopupBase {
    public static path = 'campRace/PopupReplays';
    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _popBG: CommonNormalLargePop = null;

    @property({
        type: ReplayVSNode,
        visible: true
    })
    _nodeVS1: ReplayVSNode = null;

    @property({
        type: ReplayVSNode,
        visible: true
    })
    _nodeVS2: ReplayVSNode = null;

    @property({
        type: ReplayVSNode,
        visible: true
    })
    _nodeVS3: ReplayVSNode = null;
    _reports: any;


    ctor(reports) {
        this._reports = reports;
    }
    onCreate() {
        this._popBG.addCloseEventListener(handler(this, this.closeWithAction));
        this._popBG.setTitle(Lang.get('camp_replay_title'));
        for (var i = 1; i <= 3; i++) {
            this['_nodeVS' + i].ctor(this._reports[i-1], i);
        }
    }
}