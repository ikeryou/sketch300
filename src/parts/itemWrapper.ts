import { MyObject3D } from "../webgl/myObject3D";
import { Util } from "../libs/util";
import { Object3D } from 'three/src/core/Object3D';
import { Func } from '../core/func';
import { Item } from './item';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry';
// import { BoxGeometry } from 'three/src/geometries/BoxGeometry';


export class ItemWrapper extends MyObject3D {

  private _itemWrapperA:Object3D;
  private _itemA:Array<Item> = [];
  private _itemWrapperB:Object3D;
  private _itemB:Array<Item> = [];
  private _noise:number = Util.instance.random(0, 1);

  public itemSize:number = 0;
  public cutRateA:number = 0; // 切れる
  public cutRateB:number = 0; // 切れた後の弾ける

  constructor(opt:any = {}) {
    super()

    this._itemWrapperA = new Object3D();
    this.add(this._itemWrapperA);

    this._itemWrapperB = new Object3D();
    this.add(this._itemWrapperB);

    const seg = 128
    const geo = new SphereGeometry(0.5, seg, seg);
    // const geo = new BoxGeometry(1,1,1);
    const num = 3;

    for(let i = 0; i < num; i++) {
      const itemA = new Item({
        geo:geo,
        test:0,
        lightCol:opt.lightCol,
        isLast:i == num - 1
      });
      this._itemWrapperA.add(itemA);
      this._itemA.push(itemA);
    }

    for(let i = 0; i < num; i++) {
      const itemB = new Item({
        col:this._itemA[i].getCol(),
        geo:geo,
        test:1,
        lightCol:opt.lightCol,
        isLast:i == num - 1
      });
      this._itemWrapperB.add(itemB);
      this._itemB.push(itemB);
    }

    this._resize();
  }



  protected _update():void {
    super._update();

    this._itemWrapperA.position.z = Util.instance.mix(0, this.itemSize * 0.05, this.cutRateA) * -1
    this._itemWrapperB.position.z = this._itemWrapperA.position.z * -1;

    const kake = Util.instance.mix(1.25, 1.6, this._noise) * 0.5;
    this._itemWrapperA.position.y = Util.instance.mix(0, this.itemSize * Util.instance.mix(0.05, 0.2, this._noise), this.cutRateA) * -1 + Util.instance.map(this.cutRateB, 0, 1, 0, this.itemSize * 0.1) * -1
    this._itemWrapperA.position.x = Util.instance.map(this.cutRateB, 0, 1, 0, this.itemSize * kake);
    this._itemWrapperB.position.x = this._itemWrapperA.position.x * -1;
    this._itemWrapperB.position.y = this._itemWrapperA.position.y * -1;

    const ang = Util.instance.mix(60, 250, this._noise);
    this._itemWrapperA.rotation.z = Util.instance.radian(Util.instance.map(this.cutRateB, 0, 1, 0, ang) * -1)
    this._itemWrapperA.rotation.y = Util.instance.radian(Util.instance.map(this.cutRateB, 0, 1, 0, ang) * -1)

    this._itemWrapperB.rotation.copy(this._itemWrapperA.rotation);
    this._itemWrapperB.rotation.x *= -1;
    this._itemWrapperB.rotation.y *= -1;
    this._itemWrapperB.rotation.z *= -1;
  }


  protected _resize(): void {
    super._resize();

    const w = Func.instance.sw();

    this.itemSize = w * Func.instance.val(0.2, 0.05)

    this._itemA.forEach((val,i) => {
      // const s = w * Func.instance.val(0.4, 0.3) - (i * 10);
      const s = Util.instance.map(i, 0, this._itemA.length - 1, this.itemSize, this.itemSize * 0.1);
      val.scale.set(s, s, s);
      const val2 = this._itemB[i];
      val2.scale.copy(val.scale);
    })
  }
}