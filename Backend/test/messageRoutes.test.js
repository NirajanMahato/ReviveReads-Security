const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;

chai.use(chaiHttp);

const BASE_URL = "http://localhost:5000";
let token;
let receiverId = "67beb758136c3c3514afae8a";
describe("Message API Routes", () => {
  // Log in before sending messages
  before((done) => {
    chai
      .request(BASE_URL)
      .post("/api/user/sign-in")
      .send({
        email: "nirajanmahato@gmail.com", // Use a valid user
        password: "password123",
      })
      .end((err, res) => {
        console.log("Login Response:", res.status, res.body);
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("user");
        token = res.body.user.token;
        done();
      });
  });

  // Send a message
  it("should send a message", (done) => {
    chai
      .request(BASE_URL)
      .post(`/api/messages/send/${receiverId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Hello, how are you?" }) // Match model field
      .end((err, res) => {
        console.log("Send Message Response:", res.status, res.body);
        if (err) return done(err);

        expect(res).to.have.status(201);
        expect(res.body).to.have.property("success", true);
        done();
      });
  });

  //  Fetch messages
  it("should fetch messages", (done) => {
    chai
      .request(BASE_URL)
      .get(`/api/messages/${receiverId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log("Fetch Messages Response:", res.status, res.body);
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });

  //  Get unread message count
  it("should fetch unread message count", (done) => {
    chai
      .request(BASE_URL)
      .get("/api/messages/unread")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log("Unread Messages Response:", res.status, res.body);
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("unreadCount").that.is.a("number");
        done();
      });
  });
});
