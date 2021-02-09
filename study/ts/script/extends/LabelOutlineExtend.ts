const { ccclass, property } = cc._decorator
@ccclass
export default class LabelOutlineExtend extends cc.LabelOutline {
    private useOutline: number = 1;

    _updateRenderData() {
        let label = this.node.getComponent(cc.Label);
        if (label == null) {
            return;
        }
        let labelMaterial: cc.Material = label.getMaterial(0);
        if (labelMaterial != null) {
            labelMaterial.setProperty('useOutline', this.useOutline);
            labelMaterial.setProperty("outlineColor", this.color);
        }
    }

    onEnable() {
        this.useOutline = 1;
        this._updateRenderData();
    }

    onDisable()
    {
        this.useOutline = 0;
        this._updateRenderData();
    }
}