const { ccclass, property } = cc._decorator;

@ccclass
export class Version extends cc.Component {

    start() {
        if (false) {
            cc.resources.load('version', cc.TextAsset, (err, resource:cc.TextAsset) => {
                let label = this.getComponent(cc.Label)
                label.string = resource.text.substr(0, 8);
            });
            this.node.parent.active = true;
        } else {
            this.node.parent.active = false;
        }
    }

}