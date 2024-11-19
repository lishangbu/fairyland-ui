export class CmdKit {
  /**
   * 得到主路由
   * 从 cmdMerge 中获取 [高16位] 的数值
   *
   * @param cmdMerge 合并路由 cmdMerge
   * @returns [高16位] 的数值
   */
  static getCmd(cmdMerge: number): number {
    return cmdMerge >> 16;
  }

  /**
   * 得到子路由
   * 从 cmdMerge 中获取 [低16位] 的数值
   *
   * @param cmdMerge 合并路由 cmdMerge
   * @returns [低16位] 的数值
   */
  static getSubCmd(cmdMerge: number): number {
    return cmdMerge & 0xFFFF;
  }

  /**
   * 合并两个参数,分别存放在 [高16 和 低16]
   * <pre>
   *     cmd - 高16
   *     subCmd - 低16
   *     例如 cmd = 1; subCmd = 1;
   *     mergeCmd 的结果: 65537
   *     那么 mergeCmd 对应的二进制是: [0000 0000 0000 0001] [0000 0000 0000 0001]
   * </pre>
   *
   * @param cmd    主路由存放于合并结果的高16位, 该参数不得大于 32767
   * @param subCmd 子路由存放于合并结果的低16位, 该参数不得大于 65535
   * @returns 合并的结果
   */
  static merge(cmd: number, subCmd: number): number {
    return (cmd << 16) | subCmd;
  }
}
