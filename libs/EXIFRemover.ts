import gm from "gm";

export class EXIFRemover {
  private _gmState: gm.State;

  public constructor(buffer: Buffer) {
    this._gmState = gm(buffer);
  }

  public async getBuffer() {
    return new Promise<Buffer>((resolve, reject) => {
      this._gmState.toBuffer((error, buffer) => {
        if (error) {
          return reject(error);
        }

        resolve(buffer);
      });
    });
  }

  public async getMeta() {
    return new Promise<gm.ImageInfo>((resolve, reject) => {
      this._gmState.identify((error, meta) => {
        if (error) {
          return reject(error);
        }

        resolve(meta);
      });
    });
  }

  public async removeMeta() {
    this._gmState = this._gmState.noProfile();
  }
}
