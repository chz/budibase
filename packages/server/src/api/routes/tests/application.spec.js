const {
  createApplication,
  builderEndpointShouldBlockNormalUsers,
  supertest,
  clearApplications,
  defaultHeaders,
} = require("./couchTestUtils")

describe("/applications", () => {
  let request
  let server

  beforeAll(async () => {
    ({ request, server } = await supertest())
  });

  beforeEach(async () => {
    await clearApplications(request)
  })

  afterAll(() => {
    server.close()
  })

  describe("create", () => {
    it("returns a success message when the application is successfully created", async () => {
      const res = await request
        .post("/api/applications")
        .send({ name: "My App" })
        .set(defaultHeaders())
        .expect('Content-Type', /json/)
        .expect(200)
      expect(res.res.statusMessage).toEqual("Application My App created successfully")
      expect(res.body._id).toBeDefined()
    })

    it("should apply authorization to endpoint", async () => {
      const otherApplication = await createApplication(request)
      const appId = otherApplication.instance._id
      await builderEndpointShouldBlockNormalUsers({
        request,
        method: "POST",
        url: `/api/applications`,
        appId: appId,
        body: { name: "My App" }
      })
    })

  })

  describe("fetch", () => {
    it("lists all applications", async () => {
      await createApplication(request, "app1")
      await createApplication(request, "app2")

      const res = await request
        .get("/api/applications")
        .set(defaultHeaders())
        .expect('Content-Type', /json/)
        .expect(200)

      expect(res.body.length).toBe(2)
    })

    it("should apply authorization to endpoint", async () => {
      const otherApplication = await createApplication(request)
      const appId = otherApplication.instance._id
      await builderEndpointShouldBlockNormalUsers({
        request,
        method: "GET",
        url: `/api/applications`,
        appId: appId,
      })
    })
  })

})
