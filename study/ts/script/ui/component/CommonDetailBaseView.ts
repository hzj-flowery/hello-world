import ViewBase from "../../scene/ViewBase";
import { CommonDetailModule } from "./CommonDetailModule";

const {ccclass, property} = cc._decorator;

interface SectionInfo {
    buildFunc: (param?) => CommonDetailModule
    param?
    module?: CommonDetailModule
}

@ccclass
export abstract class CommonDetailBaseView extends ViewBase {
    private currentSectionIndex: number;
    private currentCellIndex: number;

    private drawing: boolean;
    private inited: boolean;
    private nullHeight: number;

    protected _sectionInfoes: SectionInfo[];

    public onDrawComplete: () => void;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;

    onLoad() {
        this._sectionInfoes = []

        this.inited = false;
        this.drawing = false;
        this.nullHeight = 0;
        this.currentSectionIndex = 0;
        this.currentCellIndex = 0;
        this._listView.node.on("scrolling", this.onScroll, this);
        this._listView.content.anchorY = 1;
        super.onLoad();
    }

    reset() {
        this._listView.content.removeAllChildren();
        this._listView.content.height = 0;
        this._listView.content.y =  this._listView.content.parent.height;
        this.inited = false;
        this.drawing = false;
        this.nullHeight = 0;
        this.currentSectionIndex = 0;
        this.currentCellIndex = 0;
    }

    onDestroy() {
        this.inited = false;
        this.drawing = false;
        this.currentSectionIndex = 0;
        this.currentCellIndex = 0;
        
    }

    protected startDraw() {
        this.inited = true;
        this.drawing = true;
        this.schedule(this.draw, 0, cc.macro.REPEAT_FOREVER, 0);
    }

    protected stopDraw() {
        this.unschedule(this.draw);
        this.drawing = false;
        this.onDrawComplete && this.onDrawComplete();
    }

    protected draw() {
        let content = this._listView.content;
        if (content.height - content.y - this.nullHeight > 20) {
            this.stopDraw();
            return;
        }

        let sectionsCount = this.numberOfSection();
        if (this.currentSectionIndex >= sectionsCount) {
            this.stopDraw();
            return;
        }

        let cellsCount = this.numberOfCellInSection(this.currentSectionIndex);
        if (this.currentCellIndex >= cellsCount) {
            this.currentSectionIndex++;
            this.currentCellIndex = 0;
            this.draw();
            return;
        }

        this.drawing = true;
        let drawed = this.drawCellInSectionAtIndex(this.currentSectionIndex, this.currentCellIndex);
        this.currentCellIndex++;
        if (!drawed) {
            this.draw();
        }
    }

    public onScroll() {
        if (!this.inited || this.drawing) {
            return;
        }
        this.startDraw();
    }

    protected numberOfSection(): number {
        return this._sectionInfoes.length;
    }

    protected numberOfCellInSection(section: number): number {
        let module = this.getModuleOfSection(section);
        if (!module) {
            return 0;
        }

        return module.numberOfCell();
    }

    protected drawCellInSectionAtIndex(section: number, index: number): boolean {
        let module = this.getModuleOfSection(section);
        if (!module) {
            return false;
        }

        let sectionView = module.sectionView && module.sectionView()

        let footerHeight = this.getModuleFooterHeight(section);

        if (!module.node.parent) {
            if (sectionView) {
                this._listView.content.addChild(module.node);
                module.node.y = -this._listView.content.height;

                let node = sectionView;
                while(node != module.node) {
                    node.anchorY = 1;
                    node.height = footerHeight;
                    node.y = 0;
                    node = node.parent;
                }
                module.node.anchorY = 1;
                module.node.height = footerHeight;
            } else {
                //单独一个模块是没有section的
                sectionView = this._listView.content;
            }

            this.nullHeight =  (this.numberOfSection() - section - 1) * 100;
        }


        let node = module.cellAtIndex(index);
        if (!node) {
            return false;
        }

        sectionView.addChild(node);
        node.y = -(sectionView.height - footerHeight) - node.height * (1 - node.anchorY);
        if (sectionView != this._listView.content) {
            sectionView.height += node.height;
            module.node.height += node.height;
        }
        this.updateLastSectionY();

        return true;
    }

    private updateLastSectionY() {
        let content = this._listView.content;
        let count = content.childrenCount;
        let children = content.children;
        let section = children[count - 1];

        let lastHeight = 0;
        for (let i = 0; i < count - 1; i++) {
            lastHeight += children[i].height;
        }

        section.y = -lastHeight - section.height * (1 - section.anchorY);
        this._listView.content.height = lastHeight + section.height + this.nullHeight;
    }

    protected getModuleOfSection(section: number): CommonDetailModule | undefined {
        let info = this._sectionInfoes[section];
        let module = info.module;
        if (!module) {
            info.module = module = info.buildFunc.call(this, info.param);
        }
        return module;
    }

    protected getModuleFooterHeight(section: number): number {
        let module = this.getModuleOfSection(section);
        return module && module.footerHeight && module.footerHeight() || 0;
    }
}