import { removeItemAll, removeItemOnce, roundTo } from "../../src/utils";
import { randomMongoId } from "../utils/_helpers";

describe("removeItemOnce()", () => {
  it("No items to be removed", () => {
    // Arrange
    const array = [1, 2, 3];
    const value = 9;

    // Act
    const result = removeItemOnce(array, value);

    // Assert
    expect(result).toEqual(array);
  });

  it("One item to be removed, numbers", () => {
    // Arrange
    const array = [1, 2, 3];
    const value = 2;

    // Act
    const result = removeItemOnce(array, value);

    // Assert
    expect(result).toEqual([1, 3]);
  });

  it("One item to be removed, strings", () => {
    // Arrange
    const array = ["1", "2", "3"];
    const value = "2";

    // Act
    const result = removeItemOnce(array, value);

    // Assert
    expect(result).toEqual(["1", "3"]);
  });

  it("One item to be removed, mongo ObjectId", () => {
    // Arrange
    const value = randomMongoId();
    const random1 = randomMongoId();
    const random2 = randomMongoId();
    const array = [random1, value, random2];

    // Act
    const result = removeItemOnce(array, value);

    // Assert
    expect(result).toEqual([random1, random2]);
  });

  it("Many items to be removed, numbers", () => {
    // Arrange
    const array = [1, 2, 3, 2];
    const value = 2;

    // Act
    const result = removeItemOnce(array, value);

    // Assert
    expect(result).toEqual([1, 3, 2]);
  });

  it("Null value", () => {
    // Arrange
    const array = [1, 2, 3];
    const value = null;

    // Act
    const result = removeItemOnce(array, value);

    // Assert
    expect(result).toEqual(array);
  });

  it("Null value, also in array", () => {
    // Arrange
    const array = [1, null, 2, 3];
    const value = null;

    // Act
    const result = removeItemOnce(array, value);

    // Assert
    expect(result).toEqual([1, 2, 3]);
  });
});

describe("removeItemAll()", () => {
  it("No items to be removed", () => {
    // Arrange
    const array = [1, 2, 3];
    const value = 9;

    // Act
    const result = removeItemAll(array, value);

    // Assert
    expect(result).toEqual(array);
  });

  it("One item to be removed, numbers", () => {
    // Arrange
    const array = [1, 2, 3];
    const value = 2;

    // Act
    const result = removeItemAll(array, value);

    // Assert
    expect(result).toEqual([1, 3]);
  });

  it("One item to be removed, strings", () => {
    // Arrange
    const array = ["1", "2", "3"];
    const value = "2";

    // Act
    const result = removeItemAll(array, value);

    // Assert
    expect(result).toEqual(["1", "3"]);
  });

  it("One item to be removed, mongo ObjectId", () => {
    // Arrange
    const value = randomMongoId();
    const random1 = randomMongoId();
    const random2 = randomMongoId();
    const array = [random1, value, random2];

    // Act
    const result = removeItemAll(array, value);

    // Assert
    expect(result).toEqual([random1, random2]);
  });

  it("Many items to be removed, numbers", () => {
    // Arrange
    const array = [1, 2, 3, 2];
    const value = 2;

    // Act
    const result = removeItemAll(array, value);

    // Assert
    expect(result).toEqual([1, 3]);
  });

  it("Null value", () => {
    // Arrange
    const array = [1, 2, 3];
    const value = null;

    // Act
    const result = removeItemAll(array, value);

    // Assert
    expect(result).toEqual(array);
  });

  it("Null value, also in array", () => {
    // Arrange
    const array = [1, null, 2, 3];
    const value = null;

    // Act
    const result = removeItemAll(array, value);

    // Assert
    expect(result).toEqual([1, 2, 3]);
  });
});

describe("roundTo(number, number)", () => {
  it("Normal rounding down", () => {
    // Act
    const result = roundTo(1.1238, 2);

    // Assert
    expect(result).toEqual("1.12");
  });

  it("Normal rounding up", () => {
    // Act
    const result = roundTo(1.1281, 2);

    // Assert
    expect(result).toEqual("1.13");
  });

  it("Round to zero digits down", () => {
    // Act
    const result = roundTo(1.1281, 0);

    // Assert
    expect(result).toEqual("1");
  });

  it("Round to zero digits up", () => {
    // Act
    const result = roundTo(1.8281, 0);

    // Assert
    expect(result).toEqual("2");
  });

  it("Integer number, add zeros", () => {
    // Act
    const result = roundTo(1, 3);

    // Assert
    expect(result).toEqual("1.000");
  });

  it("Decimal number, add zeros", () => {
    // Act
    const result = roundTo(1.12, 4);

    // Assert
    expect(result).toEqual("1.1200");
  });

  it("Negatives, normal rounding up", () => {
    // Act
    const result = roundTo(-1.1238, 2);

    // Assert
    expect(result).toEqual("-1.12");
  });

  it("Negatives, normal rounding down", () => {
    // Act
    const result = roundTo(-1.1281, 2);

    // Assert
    expect(result).toEqual("-1.13");
  });

  it("Negatives, round to zero digits up", () => {
    // Act
    const result = roundTo(-1.1281, 0);

    // Assert
    expect(result).toEqual("-1");
  });

  it("Negatives, round to zero digits down", () => {
    // Act
    const result = roundTo(-1.8281, 0);

    // Assert
    expect(result).toEqual("-2");
  });

  it("Negatives, integer number, add zeros", () => {
    // Act
    const result = roundTo(-1, 3);

    // Assert
    expect(result).toEqual("-1.000");
  });

  it("Negatives, decimal number, add zeros", () => {
    // Act
    const result = roundTo(-1.12, 4);

    // Assert
    expect(result).toEqual("-1.1200");
  });

  it("NaN value", () => {
    // Act
    const result = roundTo(NaN, 3);

    // Assert
    expect(result).toEqual("NaN");
  });

  it("NaN digits", () => {
    // Act
    const result = roundTo(-1.12, NaN);

    // Assert
    expect(result).toEqual("-1.12");
  });
});
