const { ccclass, property } = cc._decorator;

import { TacticsTopItemModule } from "./TacticsTopItemModule";

@ccclass
export class TacticsTopItemListModule extends cc.Component {
    @property({
        type: TacticsTopItemModule,
        visible: true
    }) _nodeItem1: TacticsTopItemModule = null;
    @property({
        type: TacticsTopItemModule,
        visible: true
    }) _nodeItem2: TacticsTopItemModule = null;
    @property({
        type: TacticsTopItemModule,
        visible: true
    }) _nodeItem3: TacticsTopItemModule = null;

    ctor() {
        this.init();
    }
    init() {
        this._nodeItem1.init(5);
        this._nodeItem2.init(6);
        this._nodeItem3.init(7);
    }
    updateInfo() {
        this._nodeItem1.updateInfo();
        this._nodeItem2.updateInfo();
        this._nodeItem3.updateInfo();
    }
}