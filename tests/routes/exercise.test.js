const request = require("supertest");

const { clearDb, getToken, saveExerciseMockData } = require("../_helpers");

const database = require("../_database");

const app = require("../../src/app");

let token;

beforeAll(async () => {
  await database.connect();
  token = await getToken();
});

beforeEach(async () => await clearDb());

afterAll(async () => await database.closeDatabase());

describe("GET /exercise/:id", () => {
  it("Get own exercise", async () => {
    // Arrange
    const dbData = await saveExerciseMockData(2);

    // Act
    const res = await request(app)
      .get(`/exercise/${dbData[0]._id}`)
      .set("Authorization", token);

    // Assert
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(dbData[0]);
  });
});
