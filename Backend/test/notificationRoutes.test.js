const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;

chai.use(chaiHttp);

const BASE_URL = "http://localhost:5000";
let token;

describe("Notification API Routes", () => {
  // Log in before running tests to get a fresh token
  before((done) => {
    chai
      .request(BASE_URL)
      .post("/api/user/sign-in")
      .send({
        email: "nirajanmahato@gmail.com",
        password: "password123",
      })
      .end((err, res) => {
        console.log("Login Response:", res.body);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("user");
        token = res.body.user.token;
        done();
      });
  });

  // Test: Fetch user notifications
  it("should fetch notifications for the logged-in user", (done) => {
    chai
      .request(BASE_URL)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log("Fetch Notifications Response:", res.body);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array"); // Notifications should be returned as an array
        done();
      });
  });

  // Test: Mark notifications as read
  it("should mark all notifications as read", (done) => {
    chai
      .request(BASE_URL)
      .put("/api/notifications/mark-read")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log("Mark Notifications as Read Response:", res.body);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property(
          "message",
          "All notifications marked as read"
        );
        done();
      });
  });

  // Test: Unauthorized access should fail
  it("should return 401 for unauthorized access", (done) => {
    chai
      .request(BASE_URL)
      .get("/api/notifications")
      .end((err, res) => {
        console.log("Unauthorized Access Response:", res.body);
        expect(res).to.have.status(401);
        done();
      });
  });
});
