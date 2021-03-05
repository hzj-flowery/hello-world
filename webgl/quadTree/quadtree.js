/**
 * quadtree-js
 * @version 1.2.2
 * @license MIT
 * @author Timo Hausmann
 */

 /* https://github.com/timohausmann/quadtree-js.git v1.2.2 */
 
/*
Copyright © 2012-2020 Timo Hausmann

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

;(function() {
     
    /**
     * Quadtree Constructor
     * @param Object bounds            bounds of the node { x, y, width, height }
     * @param Integer max_objects      (optional) max objects a node can hold before splitting into 4 subnodes (default: 10)一个节点在拆分为4个子节点之前可以容纳的最大对象数
     * @param Integer max_levels       (optional) total max levels inside root Quadtree (default: 4) 根四叉树内部的总最大级别
     * @param Integer level            (optional) deepth level, required for subnodes (default: 0)
     */
    function Quadtree(bounds, max_objects, max_levels, level) {
        
        this.max_objects    = max_objects || 10;
        this.max_levels     = max_levels || 4;
        
        this.level  = level || 0;
        this.bounds = bounds;
        
        this.objects    = [];
        this.nodes      = [];
    };
    
    
    /**
     * Split the node into 4 subnodes
     */
    Quadtree.prototype.split = function() {
        
        var nextLevel   = this.level + 1,
            subWidth    = this.bounds.width/2,
            subHeight   = this.bounds.height/2,
            x           = this.bounds.x,
            y           = this.bounds.y;        
     
        //top right node
        this.nodes[0] = new Quadtree({
            x       : x + subWidth, 
            y       : y, 
            width   : subWidth, 
            height  : subHeight
        }, this.max_objects, this.max_levels, nextLevel);
        
        //top left node
        this.nodes[1] = new Quadtree({
            x       : x, 
            y       : y, 
            width   : subWidth, 
            height  : subHeight
        }, this.max_objects, this.max_levels, nextLevel);
        
        //bottom left node
        this.nodes[2] = new Quadtree({
            x       : x, 
            y       : y + subHeight, 
            width   : subWidth, 
            height  : subHeight
        }, this.max_objects, this.max_levels, nextLevel);
        
        //bottom right node
        this.nodes[3] = new Quadtree({
            x       : x + subWidth, 
            y       : y + subHeight, 
            width   : subWidth, 
            height  : subHeight
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
    Quadtree.prototype.getIndex = function(pRect) {
        
        var indexes = [],
            verticalMidpoint    = this.bounds.x + (this.bounds.width/2),
            horizontalMidpoint  = this.bounds.y + (this.bounds.height/2);    

        var startIsNorth = pRect.y < horizontalMidpoint,
            startIsWest  = pRect.x < verticalMidpoint,
            endIsEast    = pRect.x + pRect.width > verticalMidpoint,
            endIsSouth   = pRect.y + pRect.height > horizontalMidpoint;    

        //top-right quad
        if(startIsNorth && endIsEast) {
            indexes.push(0);
        }
        
        //top-left quad
        if(startIsWest && startIsNorth) {
            indexes.push(1);
        }

        //bottom-left quad
        if(startIsWest && endIsSouth) {
            indexes.push(2);
        }

        //bottom-right quad
        if(endIsEast && endIsSouth) {
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
    Quadtree.prototype.insert = function(pRect) {
        
        var i = 0,
            indexes;
         
        //if we have subnodes, call insert on matching subnodes
        if(this.nodes.length) {
            //说明我们有子节点,进一步来判断它属于哪个象限
            //如果它位于边缘，可能处于多个象限
            indexes = this.getIndex(pRect);
            
            //拿到象限以后，继续插入
            for(i=0; i<indexes.length; i++) {
                this.nodes[indexes[i]].insert(pRect);     
            }
            return;
        }
     
        //otherwise, store object here
        this.objects.push(pRect);

        //max_objects reached
        //最大的对象数达到了，就是一个子节点最多可以容纳n个对象，现在来了n+1个对象
        //并且此时节点树的高度还没有达到最大值
        if(this.objects.length > this.max_objects && this.level < this.max_levels) {
            
            //继续拆分 一分为4
            //split if we don't already have subnodes
            if(!this.nodes.length) {
                this.split();
            }
            
            //add all objects to their corresponding subnode
            for(i=0; i<this.objects.length; i++) {
                indexes = this.getIndex(this.objects[i]);
                for(var k=0; k<indexes.length; k++) {
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
    Quadtree.prototype.retrieve = function(pRect) {
         
        var indexes = this.getIndex(pRect),
            returnObjects = this.objects;
            
        //if we have subnodes, retrieve their objects
        if(this.nodes.length) {
            for(var i=0; i<indexes.length; i++) {
                returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(pRect));
            }
        }

        //remove duplicates
        returnObjects = returnObjects.filter(function(item, index) {
            return returnObjects.indexOf(item) >= index;
        });
     
        return returnObjects;
    };
    
    
    /**
     * Clear the quadtree
     */
    Quadtree.prototype.clear = function() {
        
        this.objects = [];
     
        for(var i=0; i < this.nodes.length; i++) {
            if(this.nodes.length) {
                this.nodes[i].clear();
              }
        }

        this.nodes = [];
    };

    //export for commonJS or browser
    if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Quadtree;
    } else {
        window.Quadtree = Quadtree;    
    }

})();