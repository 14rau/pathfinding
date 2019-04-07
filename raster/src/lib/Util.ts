export class Utils {
    public static getArrayWithLength(len: number) {
        let ret = [];
        for(let i = 0; i < len; i++) {
          ret.push(0);
        }
        return ret;
      }
}