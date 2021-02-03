
/**
 * 思想：四叉树就是不断拆分，缩小查找范围，来减少运算的
 * 四叉树首先他是一棵树,屏幕尺寸可以理解为树的根节点，
 * 子节点用来存放对象，四叉树也有高度，这两个条件决定是否要拆分
 * 过程如下：
 * 生成一棵四叉树：_tree = new Quadtree();
 * 向树中插入对象，
 * 情况1：如果当前数节点的对象数超过了最大对象数，并且没有达到最大高度，则可以拆分这个节点，就是将这个节点一分为四个子节点，并且将这个节点原来的对象和新对象一起
 * 重新插入这个节点的子节点中
 * 情况2：如果当前对象的节点树没有超过最大对象数或者当前节点已经是这颗树的最大高度了，那么准备插入的对象就放在
 */
export class Quadtree {
    public max_objects: any;
    public max_levels: number;//最大的深度 
    public level: number;//当前的深度
    public bounds: any;
    public objects: Array<any>;
    public nodes: Array<any>;
    /**
     * Quadtree Constructor
     * @param Object bounds            bounds of the node { x, y, width, height }
     * @param Integer max_objects      (optional) max objects a node can hold before splitting into 4 subnodes (default: 10)一个节点在拆分为4个子节点之前可以容纳的最大对象数
     * @param Integer max_levels       (optional) total max levels inside root Quadtree (default: 4) 根四叉树内部的总最大级别
     * @param Integer level            (optional) deepth level, required for subnodes (default: 0)
     */
    constructor(bounds, max_objects, max_levels, level) {
        this.max_objects = max_objects || 10;
        this.max_levels = max_levels || 4;
        this.level = level || 0;
        this.bounds = bounds;
        this.objects = [];
        this.nodes = [];
    };
    /**
     * Split the node into 4 subnodes
     */
    private split() {
        var nextLevel = this.level + 1,
            subWidth = this.bounds.width / 2,
            subHeight = this.bounds.height / 2,
            x = this.bounds.x,
            y = this.bounds.y;
        //top right node
        this.nodes[0] = new Quadtree({
            x: x + subWidth,
            y: y,
            width: subWidth,
            height: subHeight
        }, this.max_objects, this.max_levels, nextLevel);
        //top left node
        this.nodes[1] = new Quadtree({
            x: x,
            y: y,
            width: subWidth,
            height: subHeight
        }, this.max_objects, this.max_levels, nextLevel);
        //bottom left node
        this.nodes[2] = new Quadtree({
            x: x,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, this.max_objects, this.max_levels, nextLevel);
        //bottom right node
        this.nodes[3] = new Quadtree({
            x: x + subWidth,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, this.max_objects, this.max_levels, nextLevel);
    };
    /**
     * 获取当前对象属于那些象限
     * 0-3 = top-right, top-left, bottom-left, bottom-right
     * 
     * Determine which node the object belongs to
     * @param Object pRect      bounds of the area to be checked, with x, y, width, height
     * @return Array            an array of indexes of the intersecting subnodes 
     */
    private getIndex(pRect) {
        var indexes = [],
            verticalMidpoint = this.bounds.x + (this.bounds.width / 2),
            horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);
        var startIsNorth = pRect.y < horizontalMidpoint,
            startIsWest = pRect.x < verticalMidpoint,
            endIsEast = pRect.x + pRect.width > verticalMidpoint,
            endIsSouth = pRect.y + pRect.height > horizontalMidpoint;
        //top-right quad
        if (startIsNorth && endIsEast) {
            indexes.push(0);
        }
        //top-left quad
        if (startIsWest && startIsNorth) {
            indexes.push(1);
        }
        //bottom-left quad
        if (startIsWest && endIsSouth) {
            indexes.push(2);
        }
        //bottom-right quad
        if (endIsEast && endIsSouth) {
            indexes.push(3);
        }
        return indexes;
    };
    /**
     * 插入一个节点到这颗树上
     * Insert the object into the node. If the node
     * exceeds the capacity, it will split and add all
     * objects to their corresponding subnodes.
     * @param Object pRect        bounds of the object to be added { x, y, width, height }
     */
    public insert(pRect) {
        var i = 0,
            indexes;
        //if we have subnodes, call insert on matching subnodes
        if (this.nodes.length) {
            //说明我们有子节点,进一步来判断它属于哪个象限
            //如果它位于边缘，可能处于多个象限
            indexes = this.getIndex(pRect);
            //拿到象限以后，继续插入
            for (i = 0; i < indexes.length; i++) {
                this.nodes[indexes[i]].insert(pRect);
            }
            return;
        }
        //otherwise, store object here
        this.objects.push(pRect);
        //max_objects reached
        //最大的对象数达到了，就是一个子节点最多可以容纳n个对象，现在来了n+1个对象
        //并且此时节点树的高度还没有达到最大值
        if (this.objects.length > this.max_objects && this.level < this.max_levels) {
            //继续拆分 一分为4
            //split if we don't already have subnodes
            if (!this.nodes.length) {
                this.split();
            }
            //add all objects to their corresponding subnode
            for (i = 0; i < this.objects.length; i++) {
                indexes = this.getIndex(this.objects[i]);
                for (var k = 0; k < indexes.length; k++) {
                    this.nodes[indexes[k]].insert(this.objects[i]);
                }
            }
            //clean up this node
            this.objects = [];
        }
    };
    /**
     * 外界输入一个对象，先求出当前这个对象在那个象限里，再求出这个象限里有多少个其他对象，返回这些对象，用作外界逻辑
     * Return all objects that could collide with the given object
     * @param Object pRect      bounds of the object to be checked { x, y, width, height }
     * @Return Array            array with all detected objects
     */
    public retrieve(pRect) {
        var indexes = this.getIndex(pRect),
            returnObjects = this.objects;
        //if we have subnodes, retrieve their objects
        if (this.nodes.length) {
            for (var i = 0; i < indexes.length; i++) {
                returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(pRect));
            }
        }
        //remove duplicates
        returnObjects = returnObjects.filter(function (item, index) {
            return returnObjects.indexOf(item) >= index;
        });
        return returnObjects;
    };
    /**
     * Clear the quadtree
     */
    public clear() {
        this.objects = [];
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes.length) {
                this.nodes[i].clear();
            }
        }
        this.nodes = [];
    };
}