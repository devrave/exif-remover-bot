import gm from "gm";
import { promisify } from "util";

export class EXIFRemover {
  private _gmState: gm.State;

  public constructor(buffer: Buffer) {
    this._gmState = gm(buffer);
  }

  public async getBuffer() {
    const toBuffer = promisify<Buffer>(this._gmState.toBuffer).bind(this._gmState);

    return toBuffer();
  }

  public async getMeta() {
    const identify = promisify<gm.ImageInfo>(this._gmState.identify).bind(this._gmState);

    return identify();
  }

  public async removeMeta() {
    this._gmState = this._gmState.noProfile();
  }
}
