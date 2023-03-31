export interface ICleanOption {
  /**
   * 如果为workspace模式，则存在此参数
   * 否则，为undefined，即为当包
   */
  workspace?: string[];


}

export async function clean(option: ICleanOption) {

}
