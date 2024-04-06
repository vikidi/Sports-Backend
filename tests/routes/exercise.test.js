const request = require("supertest");

const { clearDb, getUser, saveExerciseMockData } = require("../_helpers");

const database = require("../_database");

const app = require("../../src/app");

let userAuth0;

beforeAll(async () => {
  await database.connect();
  userAuth0 = await getUser("openid");
});

beforeEach(async () => await clearDb());

afterAll(async () => {
  //await clearDb();
  await database.closeDatabase();
});

describe("GET /exercise/:id", () => {
  it("Get own exercise", async () => {
    // Arrange
    const dbData = await saveExerciseMockData(2, [
      { user: userAuth0.id },
      { user: userAuth0.id },
    ]);

    const expectedData = dbData[0];

    // Act
    const res = await request(app)
      .get(`/exercise/${dbData[0]._id}`)
      .set("Authorization", userAuth0.token);

    // Assert
    expect(res.statusCode).toEqual(200);
    expect(res.type).toEqual("application/json");

    expect(res.body._id).toEqual(expectedData._id.toString());
    expect(res.body.group).toEqual(expectedData.group);
    expect(res.body.sport).toEqual(expectedData.sport);
    expect(res.body.startingEpoch).toEqual(expectedData.startingEpoch);
    expect(res.body.parsedDate).toEqual(expectedData.parsedDate.toISOString());
    expect(res.body.distanceMeters).toEqual(expectedData.distanceMeters);
    expect(res.body.elapsedSec).toEqual(expectedData.elapsedSec);
    expect(res.body.averageHeartRate).toEqual(expectedData.averageHeartRate);
    expect(res.body.averagePace).toEqual(expectedData.averagePace);
    expect(res.body.averageCadence).toEqual(expectedData.averageCadence);
    expect(res.body.averageWatts).toEqual(expectedData.averageWatts);

    res.body.trackPoints.forEach((trackPoint, i) => {
      expect(trackPoint.latitude).toEqual(expectedData.trackPoints[i].latitude);
      expect(trackPoint.longitude).toEqual(
        expectedData.trackPoints[i].longitude
      );
      expect(trackPoint.altitudeMeters).toEqual(
        expectedData.trackPoints[i].altitudeMeters
      );
      expect(trackPoint.elapsedSec).toEqual(
        expectedData.trackPoints[i].elapsedSec
      );
      expect(trackPoint).not.toHaveProperty("_id");
    });

    expect(res.body).not.toHaveProperty("user");
    expect(res.body).not.toHaveProperty("createdAt");
    expect(res.body).not.toHaveProperty("__v");
  });
});
