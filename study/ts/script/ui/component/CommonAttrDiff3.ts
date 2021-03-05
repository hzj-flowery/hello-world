import CommonAttrDiff from "./CommonAttrDiff";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonAttrDiff3 extends CommonAttrDiff {
    setLabelStr(subNodeName: string, value: string): void{
        var node: cc.Node = this.node.getChildByName(subNodeName) as cc.Node;
        if(!node) return;
        var label: cc.Label = node.getComponent(cc.Label);
        label.string = value;
    }
}