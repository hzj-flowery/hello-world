export interface CommonDetailModule extends cc.Component {
    numberOfCell(): number;
    cellAtIndex(i: number): cc.Node
    sectionView?(): cc.Node

    footerHeight?(): number
}