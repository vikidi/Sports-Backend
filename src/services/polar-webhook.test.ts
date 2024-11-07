import Connection from "../models/connection";
import { validateRequestSignature } from "./polar-webhook";
import { Request } from "express";
import { calculateHmac } from "../utils/signatures";

jest.mock("../models/connection");
jest.mock("../utils/signatures");

describe("validateRequestSignature()", () => {
  const req = {
    header: jest.fn(),
    body: "request-body",
  } as unknown as Request;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Returns false when signature header is not present", async () => {
    // Arrange
    jest.mocked(req.header).mockReturnValue(undefined);
    jest.mocked(Connection.findById).mockResolvedValue(undefined);

    // Act
    const result = await validateRequestSignature(req);

    // Assert
    expect(result).toBe(false);
  });

  it("Returns false when connection document is not found", async () => {
    // Arrange
    jest.mocked(req.header).mockReturnValue("signature-header");
    jest.mocked(Connection.findById).mockResolvedValue(undefined);

    // Act
    const result = await validateRequestSignature(req);

    // Assert
    expect(result).toBe(false);
  });

  it("Returns false when signatureSecretKey is not present", async () => {
    // Arrange
    jest.mocked(req.header).mockReturnValue("signature-header");
    jest
      .mocked(Connection.findById)
      .mockResolvedValue({ signatureSecretKey: null });

    // Act
    const result = await validateRequestSignature(req);

    // Assert
    expect(result).toBe(false);
  });

  it("Returns true when calculated signature matches signature header", async () => {
    // Arrange
    jest.mocked(req.header).mockReturnValue("signature-header");
    jest
      .mocked(Connection.findById)
      .mockResolvedValue({ signatureSecretKey: "secret-key" });
    jest.mocked(calculateHmac).mockReturnValue("signature-header");

    // Act
    const result = await validateRequestSignature(req);

    // Assert
    expect(result).toBe(true);
  });

  it("Returns false when calculated signature does not match signature header", async () => {
    // Assign
    jest.mocked(req.header).mockReturnValue("signature-header");
    jest
      .mocked(Connection.findById)
      .mockResolvedValue({ signatureSecretKey: "secret-key" });
    jest.mocked(calculateHmac).mockReturnValue("different-signature");

    // Act
    const result = await validateRequestSignature(req);

    // Assert
    expect(result).toBe(false);
  });
});
