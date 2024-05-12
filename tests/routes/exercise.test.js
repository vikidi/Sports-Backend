const request = require("supertest");

const Exercise = require("../../src/models/exercise");

const {
  clearDb,
  getUser,
  randomMongoId,
  randomAuth0Id,
  saveExerciseMockData,
} = require("../_helpers");

const database = require("../_database");

const app = require("../../src/app");

let userAuth0;

beforeAll(async () => {
  await database.connect();
  userAuth0 = await getUser("openid");
});

beforeEach(async () => await clearDb());

afterAll(async () => {
  await clearDb();
  await database.closeDatabase();
});

describe("GET /exercises/:id", () => {
  it("Get own exercise", async () => {
    // Arrange
    const dbData = await saveExerciseMockData(2, [
      { user: userAuth0.id },
      { user: userAuth0.id },
    ]);

    const { user, createdAt, updatedAt, ...expectedData } = dbData[0];

    // Act
    const res = await request(app)
      .get(`/exercises/${dbData[0]._id}`)
      .set("Authorization", userAuth0.token);

    // Assert
    expect(res.statusCode).toEqual(200);
    expect(res.type).toEqual("application/json");

    expect(res.body).toEqual(expectedData);
  });

  it("Exercise not found", async () => {
    // Arrange
    await saveExerciseMockData(1, [{ user: userAuth0.id }]);

    // Act
    const res = await request(app)
      .get(`/exercises/${randomMongoId()}`)
      .set("Authorization", userAuth0.token);

    // Assert
    expect(res.statusCode).toEqual(404);
    expect(res.body).toBeEmpty();
  });

  it("Invalid exercise ID", async () => {
    // Arrange
    await saveExerciseMockData(1, [{ user: userAuth0.id }]);

    const expectedData = {
      errors: expect.any(Array),
    };

    // Act
    const res = await request(app)
      .get(`/exercises/invalid-id`)
      .set("Authorization", userAuth0.token);

    // Assert
    expect(res.statusCode).toEqual(400);
    expect(res.type).toEqual("application/json");
    expect(res.body).toEqual(expectedData);
  });

  it("Unauthenticated", async () => {
    // Arrange
    const dbData = await saveExerciseMockData(1, [{ user: userAuth0.id }]);

    // Act
    const res = await request(app).get(`/exercises/${dbData[0]._id}`);

    // Assert
    expect(res.statusCode).toEqual(401);
    expect(res.body).toBeEmpty();
  });

  it("Unauthorized", async () => {
    // Arrange
    const dbData = await saveExerciseMockData(1, [{ user: randomAuth0Id() }]);

    // Act
    const res = await request(app)
      .get(`/exercises/${dbData[0]._id}`)
      .set("Authorization", userAuth0.token);

    // Assert
    expect(res.statusCode).toEqual(403);
    expect(res.body).toBeEmpty();
  });
});

describe("DELETE /exercises/:id", () => {
  it("Delete own exercise", async () => {
    // Arrange
    const dbData = await saveExerciseMockData(2, [
      { user: userAuth0.id },
      { user: userAuth0.id },
    ]);

    // Act
    const res = await request(app)
      .delete(`/exercises/${dbData[0]._id}`)
      .set("Authorization", userAuth0.token);

    // Assert
    const allExercises = await Exercise.find({});

    expect(res.statusCode).toEqual(204);
    expect(res.body).toBeEmpty();

    expect(allExercises).toHaveLength(1);
    expect(allExercises).not.toContain(
      expect.objectContaining({ _id: dbData[0]._id })
    );
  });

  // TODO: Successful, group connection also deleted

  it("Exercise not found", async () => {
    // Arrange
    await saveExerciseMockData(1, [{ user: userAuth0.id }]);

    // Act
    const res = await request(app)
      .delete(`/exercises/${randomMongoId()}`)
      .set("Authorization", userAuth0.token);

    // Assert
    expect(res.statusCode).toEqual(404);
    expect(res.body).toBeEmpty();
  });

  it("Invalid exercise ID", async () => {
    // Arrange
    await saveExerciseMockData(1, [{ user: userAuth0.id }]);

    const expectedData = {
      errors: expect.any(Array),
    };

    // Act
    const res = await request(app)
      .delete(`/exercises/invalid-id`)
      .set("Authorization", userAuth0.token);

    // Assert
    expect(res.statusCode).toEqual(400);
    expect(res.type).toEqual("application/json");
    expect(res.body).toEqual(expectedData);
  });

  it("Unauthenticated", async () => {
    // Arrange
    const dbData = await saveExerciseMockData(1, [{ user: userAuth0.id }]);

    // Act
    const res = await request(app).delete(`/exercises/${dbData[0]._id}`);

    // Assert
    expect(res.statusCode).toEqual(401);
    expect(res.body).toBeEmpty();
  });

  it("Unauthorized", async () => {
    // Arrange
    const dbData = await saveExerciseMockData(1, [{ user: randomAuth0Id() }]);

    // Act
    const res = await request(app)
      .delete(`/exercises/${dbData[0]._id}`)
      .set("Authorization", userAuth0.token);

    // Assert
    expect(res.statusCode).toEqual(403);
    expect(res.body).toBeEmpty();
  });
});
