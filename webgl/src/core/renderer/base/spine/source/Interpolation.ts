export class Interpolation{

        constructor(){
        }
        public apply(start, end, a) {
            return start + (end - start) * this.applyInternal(a);
        };
       
    }
