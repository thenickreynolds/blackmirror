export default class Assert {
  static true(condition: boolean, message?: string) {
    if (!condition) {
      throw new Error(message || "Assrted false");
    }
  }

  static notNull<T>(field?: T, message?: string) {
    if (field === null || field === undefined) {
      throw new Error(message || "Field was null");
    }

    return field!;
  }
}
