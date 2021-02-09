export class IntSet{

        function IntSet() {
            this.array = new Array();
        }
        public add(value) {
            var contains = this.contains(value);
            this.array[value | 0] = value | 0;
            return !contains;
        };
        public contains(value) {
            return this.array[value | 0] != undefined;
        };
        public remove(value) {
            this.array[value | 0] = undefined;
        };
        public clear() {
            this.array.length = 0;
        };
        return IntSet;
    }