type MaybeEmptyString = string | undefined | null;

export default class Strings {
  static isNull(str: MaybeEmptyString) {
    return str === null || str === undefined;
  }

  static isEmptyOrNull(str: MaybeEmptyString) {
    return str === null || str === undefined || str.length === 0;
  }

  static defaultIfNull(str: MaybeEmptyString, defaultValue: string) {
    return str === null || str === undefined ? defaultValue : str;
  }

  static emptyIfNull(str: MaybeEmptyString) {
    return this.defaultIfNull(str, "");
  }

  static defaultIfNullOrEmpty(str: MaybeEmptyString, def: string) {
    return this.isEmptyOrNull(str) ? def : (str as string);
  }

  static nullIfUndefined(str: MaybeEmptyString) {
    return str === undefined ? null : str;
  }
}
