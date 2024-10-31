import request from "supertest";
import Exercise from "../../src/models/exercise";
import Group from "../../src/models/group";
import {
  clearDb,
  randomMongoId,
  randomAuth0Id,
  saveExerciseMockData,
  saveGroupMockData,
  getAuth0User,
} from "../utils/_helpers";
import { connect, closeDatabase } from "../utils/_database";
import app from "../../src/app";
import path from "path";
import { Auth0User } from "../common/types";

let userAuth0: Auth0User;

beforeAll(async () => {
  await connect();
  userAuth0 = await getAuth0User();
});

beforeEach(async () => await clearDb());

afterAll(async () => {
  await clearDb();
  await closeDatabase();
});

describe("POST /exercises", () => {
  it("Save exercise file", async () => {
    // Arrange

    // Act
    const res = await request(app)
      .post(`/exercises`)
      .set("Authorization", userAuth0.token)
      .attach(
        "exercise",
        path.resolve(
          __dirname,
          "../data/Ville_Saarinen_2023-09-05_19-11-30.TCX"
        )
      );

    // Assert
    const allExercises = await Exercise.find({});

    expect(res.statusCode).toEqual(204);
    expect(res.body).toBeEmpty();

    expect(allExercises).toHaveLength(1);
    expect(allExercises).toEqual(
      expect.arrayContaining([expect.objectContaining({ user: userAuth0.id })])
    );
  });

  it("Missing file", async () => {
    // Arrange

    // Act
    const res = await request(app)
      .post(`/exercises`)
      .set("Authorization", userAuth0.token);

    // Assert
    const allExercises = await Exercise.find({});

    expect(res.statusCode).toEqual(400);

    expect(allExercises).toHaveLength(0);
  });

  it("Incorrect file", async () => {
    // Arrange

    // Act
    const res = await request(app)
      .post(`/exercises`)
      .set("Authorization", userAuth0.token)
      .attach("exercise", path.resolve(__dirname, "../data/routes.json"));

    // Assert
    const allExercises = await Exercise.find({});

    expect(res.statusCode).toEqual(400);

    expect(allExercises).toHaveLength(0);
  });

  it("Unauthenticated", async () => {
    // Arrange
    await saveExerciseMockData(1, [{ user: userAuth0.id }]);

    // Act
    const res = await request(app).get(`/exercises`);

    // Assert
    expect(res.statusCode).toEqual(401);
  });
});

describe("GET /exercises", () => {
  it("Get own exercises", async () => {
    // Arrange
    const dbData = await saveExerciseMockData(3, [
      { user: userAuth0.id },
      { user: userAuth0.id },
      { user: randomAuth0Id() },
    ]);

    dbData.forEach((element: any) => {
      delete element.user;
      delete element.createdAt;
      delete element.updatedAt;
      delete element.group;
      delete element.trackPoints;
    });
    const expectedData = [dbData[0], dbData[1]];

    // Act
    const res = await request(app)
      .get(`/exercises`)
      .set("Authorization", userAuth0.token);

    // Assert
    expect(res.statusCode).toEqual(200);
    expect(res.type).toEqual("application/json");

    expect(res.body).toEqual(expectedData);
  });

  it("No own exercises", async () => {
    // Arrange
    await saveExerciseMockData(1, [{ user: randomAuth0Id() }]);

    // Act
    const res = await request(app)
      .get(`/exercises`)
      .set("Authorization", userAuth0.token);

    // Assert
    expect(res.statusCode).toEqual(200);
    expect(res.type).toEqual("application/json");
    expect(res.body).toBeEmpty();
  });

  it("Unauthenticated", async () => {
    // Arrange
    await saveExerciseMockData(1, [{ user: userAuth0.id }]);

    // Act
    const res = await request(app).get(`/exercises`);

    // Assert
    expect(res.statusCode).toEqual(401);
  });
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
  });

  it("Invalid exercise ID", async () => {
    // Arrange
    await saveExerciseMockData(1, [{ user: userAuth0.id }]);

    // Act
    const res = await request(app)
      .get(`/exercises/invalid-id`)
      .set("Authorization", userAuth0.token);

    // Assert
    expect(res.statusCode).toEqual(400);
  });

  it("Unauthenticated", async () => {
    // Arrange
    const dbData = await saveExerciseMockData(1, [{ user: userAuth0.id }]);

    // Act
    const res = await request(app).get(`/exercises/${dbData[0]._id}`);

    // Assert
    expect(res.statusCode).toEqual(401);
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
  });
});

describe("DELETE /exercises/:id", () => {
  it("Delete own exercise, no group connected", async () => {
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

  it("Delete own exercise having group connected", async () => {
    // Arrange
    let groupId = randomMongoId();

    const exerciseDbData = await saveExerciseMockData(2, [
      { user: userAuth0.id, group: groupId },
      { user: userAuth0.id },
    ]);

    await saveGroupMockData(1, [
      { _id: groupId, user: userAuth0.id, exercises: [exerciseDbData[0]._id] },
    ]);

    // Act
    const res = await request(app)
      .delete(`/exercises/${exerciseDbData[0]._id}`)
      .set("Authorization", userAuth0.token);

    // Assert
    const allExercises = await Exercise.find({});
    const sutGroup = await Group.findById(groupId);

    expect(res.statusCode).toEqual(204);
    expect(res.body).toBeEmpty();

    expect(allExercises).toHaveLength(1);
    expect(allExercises).not.toContain(
      expect.objectContaining({ _id: exerciseDbData[0]._id })
    );

    expect(sutGroup?.exercises).toBeEmpty();
  });

  it("Exercise not found", async () => {
    // Arrange
    await saveExerciseMockData(1, [{ user: userAuth0.id }]);

    // Act
    const res = await request(app)
      .delete(`/exercises/${randomMongoId()}`)
      .set("Authorization", userAuth0.token);

    // Assert
    expect(res.statusCode).toEqual(404);
  });

  it("Invalid exercise ID", async () => {
    // Arrange
    await saveExerciseMockData(1, [{ user: userAuth0.id }]);

    // Act
    const res = await request(app)
      .delete(`/exercises/invalid-id`)
      .set("Authorization", userAuth0.token);

    // Assert
    expect(res.statusCode).toEqual(400);
  });

  it("Unauthenticated", async () => {
    // Arrange
    const dbData = await saveExerciseMockData(1, [{ user: userAuth0.id }]);

    // Act
    const res = await request(app).delete(`/exercises/${dbData[0]._id}`);

    // Assert
    expect(res.statusCode).toEqual(401);
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
  });
});
