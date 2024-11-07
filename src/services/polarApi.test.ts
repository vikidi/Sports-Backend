import axios from "axios";
import { deleteWebhook, fetchWebhook, POLAR_BASE_URL } from "./polarApi";
import { getPolarAuthorization } from "../utils/polar";

jest.mock("axios");

describe("fetchWebhook()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should make a GET request to Polar API with correct headers", async () => {
    // Arrange
    const axiosGetMock = jest.mocked(axios.get);
    axiosGetMock.mockResolvedValue({ data: {} });

    // Act
    await fetchWebhook();

    // Assert
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(POLAR_BASE_URL, {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${getPolarAuthorization()}`,
      },
    });
  });

  it("Should return the response from the Polar API", async () => {
    // Arrange
    const response = { data: "Mock response" };
    const axiosGetMock = jest.mocked(axios.get);
    axiosGetMock.mockResolvedValue(response);

    // Act
    const result = await fetchWebhook();

    // Assert
    expect(result).toBe(response);
  });

  it("Should throw an error if the GET request fails", async () => {
    // Arrange
    const error = new Error("Mock error");
    const axiosGetMock = jest.mocked(axios.get);
    axiosGetMock.mockRejectedValue(error);

    // Assert
    await expect(fetchWebhook()).rejects.toThrow(error);
  });

  it("Should throw an error if the Polar API URL is invalid", async () => {
    // Arrange
    const invalidUrl = "invalid-url";
    const axiosGetMock = jest.mocked(axios.get);
    axiosGetMock.mockRejectedValue(
      new Error(`getaddrinfo ENOTFOUND ${invalidUrl}`)
    );

    // Assert
    await expect(fetchWebhook()).rejects.toThrow();
  });
});

describe("deleteWebhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should make a DELETE request to Polar API with correct headers", async () => {
    // Assign
    const webhookId = "test-webhook-id";
    const axiosDeleteMock = jest.mocked(axios.delete);
    axiosDeleteMock.mockResolvedValue({ data: {} });

    // Act
    await deleteWebhook(webhookId);

    // Assert
    expect(axiosDeleteMock).toHaveBeenCalledTimes(1);
    expect(axiosDeleteMock).toHaveBeenCalledWith(
      `${POLAR_BASE_URL}/${webhookId}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${getPolarAuthorization()}`,
        },
      }
    );
  });

  it("Should throw an error if Polar API request fails", async () => {
    // Assign
    const webhookId = "test-webhook-id";
    const error = new Error("Mock error");
    const axiosDeleteMock = jest.mocked(axios.delete);
    axiosDeleteMock.mockRejectedValue(error);

    // Assert
    await expect(deleteWebhook(webhookId)).rejects.toThrow(error);
  });
});
