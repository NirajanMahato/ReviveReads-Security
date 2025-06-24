const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;

chai.use(chaiHttp);

const BASE_URL = "http://localhost:5000";

describe("User API Routes", () => {
  let token;
  let userId;

  // User Signup (if not already registered)
  it("should register a new user", (done) => {
    chai
      .request(BASE_URL)
      .post("/api/user/sign-up")
      .send({
        name: "Nirajan Mahato",
        email: "nirajanmahato@gmail.com",
        password: "password123",
        address: "Kathmandu",
      })
      .end((err, res) => {
        console.log(res.body); // Debugging output
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("success", true);
        done();
      });
  });

  // Log in Before Running Protected Routes
  beforeEach((done) => {
    chai
      .request(BASE_URL)
      .post("/api/user/sign-in")
      .send({
        email: "nirajanmahato@gmail.com",
        password: "password123",
      })
      .end((err, res) => {
        console.log("Login Response:", res.body); // Debugging output
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("user");
        token = res.body.user.token; // Get new valid token
        userId = res.body.user.id;
        done();
      });
  });

  // Get user by ID (after getting fresh token)
  it("should fetch user details", (done) => {
    chai
      .request(BASE_URL)
      .get(`/api/user/get-user-by-id/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log(res.body); // Debugging output
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("email", "nirajanmahato@gmail.com");
        done();
      });
  });

  //  Add a book to favorites
  it("should add a book to favorites", (done) => {
    chai
      .request(BASE_URL)
      .post("/api/user/add-to-favorites")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookId: "testBookId" })
      .end((err, res) => {
        console.log(res.body); // Debugging output
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("success", true);
        done();
      });
  });

  // Get favorite books
  it("should get favorite books", (done) => {
    chai
      .request(BASE_URL)
      .get("/api/user/get-favorites-books")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log(res.body); // Debugging output
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });

  // Remove a book from favorites
  it("should remove a book from favorites", (done) => {
    chai
      .request(BASE_URL)
      .delete("/api/user/remove-from-favorites/testBookId")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log(res.body); // Debugging output
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("success", true);
        done();
      });
  });
});
