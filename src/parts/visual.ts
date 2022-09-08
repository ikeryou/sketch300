import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Update } from '../libs/update';
import { Scroller } from "../core/scroller";
import { Tween } from "../core/tween";
import { Util } from "../libs/util";
import { Color } from 'three/src/math/Color';
import { Conf } from '../core/conf';
import { HSL } from '../libs/hsl';
import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { AmbientLight } from 'three/src/lights/AmbientLight';
import { CineonToneMapping, sRGBEncoding } from 'three/src/constants';
import { itemScroll } from './itemScroll';
import { ItemWrapper } from './itemWrapper';
import { Easing } from '../libs/easing';

export class Visual extends Canvas {

  private _con:Object3D;
  private _item:Array<ItemWrapper> = [];
  private _scrollItem:itemScroll;
  private _bgColor:Color = new Color();
  private _scroll:number = 0;
  private _light:DirectionalLight;

  constructor(opt: any) {
    super(opt);

    this._light = new DirectionalLight(Util.instance.randomArr(Conf.instance.COLOR).clone(), 0.5);
    this.mainScene.add(this._light)
    this._light.position.set(4, 4, 4);

    const ambientLight = new AmbientLight(Util.instance.randomArr(Conf.instance.COLOR).clone(), 0.5);
    this.mainScene.add(ambientLight);

    this._con = new Object3D();
    this.mainScene.add(this._con);

    for(let i = 0; i < 16; i++) {
      const item = new ItemWrapper({
        lightCol:this._light.color,
      })
      this._con.add(item);
      this._item.push(item);
    }

    // 背景の色
    const col = Util.instance.randomArr(Conf.instance.COLOR).clone();
    const hsl = new HSL();
    col.getHSL(hsl);
    hsl.l *= 1.2;
    col.setHSL(hsl.h, hsl.s, hsl.l);
    this._bgColor = col;

    // スクロールの
    this._scrollItem = new itemScroll({
      col:this._bgColor.clone()
    })
    this._con.add(this._scrollItem);

    this._con.rotation.x = Util.instance.radian(45);
    this._con.rotation.y = Util.instance.radian(-45);

    Scroller.instance.set(0);
    this._resize()
  }


  protected _update(): void {
    super._update()

    const sw = Func.instance.sw()
    // const sh = Func.instance.sh()
    const moveDist = (sw / Math.cos(Util.instance.radian(45)));

    this._con.position.y = Func.instance.screenOffsetY() * -1

    const scroll = Scroller.instance.val.y;
    const scrollArea = moveDist * 2;
    const itemSize = this._item[0].itemSize;

    this._scroll += (scroll - this._scroll) * 0.1;

    Tween.instance.set(document.querySelector('.l-height'), {
      height:scrollArea
    })

    // 0-1に変換
    const sRate = Util.instance.map(this._scroll, 0, scrollArea - moveDist, 0, 1);

    this._scrollItem.scale.set(moveDist * Func.instance.val(1, 0.75), itemSize * 2, 1);
    this._scrollItem.rotation.y = Util.instance.radian(90);
    const kake = Func.instance.val(2, 1)
    this._scrollItem.position.y = Util.instance.map(sRate, 0, 1, moveDist, -moveDist * kake);
    // this._scrollItem.position.y = this._scrollItem.scale.y * 0.5 - itemSize * 0.5

    const interval = itemSize * 0;
    const totalWidth = (itemSize + interval) * this._item.length - interval;

    this._item.forEach((val,i) => {
      val.position.z = i * ((val.itemSize + interval) * -1) + totalWidth * 0.5 - itemSize * 0.5;

      const d = (this._scrollItem.position.y - val.itemSize * 0.5) - (val.position.y + val.itemSize * 0.5);
      val.cutRateA = Util.instance.map(d, val.itemSize * 0.5 - val.itemSize, val.itemSize * 0.5, 1, 0);

      // 切った後
      val.cutRateB = Easing.instance.inOutSine(Util.instance.map(d, val.itemSize * 0.5 - val.itemSize * 20, val.itemSize * 0.5 - val.itemSize, 1, 0));

    })

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    this.renderer.setClearColor(this._bgColor, 1)
    this.renderer.render(this.mainScene, this.cameraOrth)
  }


  public isNowRenderFrame(): boolean {
    return this.isRender && Update.instance.cnt % 1 == 0
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();



    this.renderSize.width = w;
    this.renderSize.height = h;

    this._updateOrthCamera(this.cameraOrth, w, h);
    this._updatePersCamera(this.cameraPers, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.toneMapping = CineonToneMapping;
    this.renderer.toneMappingExposure = 1.75;

    if (isRender) {
      this._render();
    }
  }
}
