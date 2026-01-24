export type VariableScope = 'local' | 'global';

export interface GetVariableInput {
  /** 变量名 */
  name: string;
  /** 作用域。默认为 'local'。 */
  scope?: VariableScope;
}

export interface GetVariableOutput {
  /** 变量当前值 */
  value: any;
}

export interface ListVariableInput {
  /** 作用域。默认为 'local'。 */
  scope?: VariableScope;
}

export interface ListVariableOutput {
  /** 所有变量映射表 */
  variables: Record<string, any>;
}

export interface SetVariableInput {
  /** 变量名 */
  name: string;
  /** 要设置的值 */
  value: any;
  /** 作用域。默认为 'local'。 */
  scope?: VariableScope;
}

export interface SetVariableOutput {
  ok: boolean;
}

export interface DeleteVariableInput {
  /** 变量名 */
  name: string;
  /** 作用域。默认为 'local'。 */
  scope?: VariableScope;
}

export interface DeleteVariableOutput {
  ok: boolean;
}

export interface ModifyVariableInput {
  /** 变量名 */
  name: string;
  /** 增加的值（仅对 add 操作有效） */
  value?: any;
  /** 作用域。默认为 'local'。 */
  scope?: VariableScope;
}

export interface ModifyVariableOutput {
  ok: boolean;
}
