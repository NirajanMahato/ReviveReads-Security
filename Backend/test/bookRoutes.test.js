const chai = require("chai");
const chaiHttp = require("chai-http");
const fs = require("fs");
const path = require("path");
const { expect } = chai;

chai.use(chaiHttp);

const BASE_URL = "http://localhost:5000";
let token;
let bookId;

// Test image path
const testImagePath = path.join(__dirname, "test-assets", "test-image.jpeg");

describe("Book API Routes", () => {
  //  Log in before running tests to get a fresh token
  before((done) => {
    chai
      .request(BASE_URL)
      .post("/api/user/sign-in")
      .send({
        email: "nirajanmahato@gmail.com",
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

  //  Add a new book
  it("should add a new book with an image", (done) => {
    chai
      .request(BASE_URL)
      .post("/api/book/post-book")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Advanced Node.js")
      .field("genre", "Technology") // Must match enum
      .field("description", "This is a Node.js programming book.")
      .field("price", "1000")
      .field("condition", "Like New") // Must match enum
      .field("delivery", "true")
      .attach("images", fs.readFileSync(testImagePath), "test-image.jpeg") // Attach image
      .end((err, res) => {
        console.log("Book Creation Response:", res.status, res.body);
        if (err) return done(err);

        expect(res).to.have.status(201);
        expect(res.body).to.have.property("success", true);
        bookId = res.body.book?._id; // Ensure book ID is stored
        console.log("Book ID:", bookId);
        done();
      });
  });

  //  Fetch book details
  it("should fetch book details", (done) => {
    if (!bookId) return done(new Error("No valid bookId found!"));

    chai
      .request(BASE_URL)
      .get(`/api/book/get-book-by-id/${bookId}`)
      .end((err, res) => {
        console.log("Fetch Book Response:", res.status, res.body);
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("title", "Advanced Node.js");
        done();
      });
  });

  //  Mark book as sold
  it("should mark the book as sold", (done) => {
    if (!bookId) return done(new Error("No valid bookId found!"));

    chai
      .request(BASE_URL)
      .patch(`/api/book/mark-as-sold/${bookId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        console.log("Mark as Sold Response:", res.status, res.body);
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("success", true);
        done();
      });
  });

  // Delete the book
  it("should delete a book", (done) => {
    if (!bookId) return done(new Error("No valid bookId found!"));

    chai
      .request(BASE_URL)
      .delete("/api/book/delete-book")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookId })
      .end((err, res) => {
        console.log("Delete Book Response:", res.status, res.body);
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("success", true);
        done();
      });
  });
});
