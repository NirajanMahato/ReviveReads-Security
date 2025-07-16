const Book = require("../models/Book");
const User = require("../models/User");
const { createNotification } = require("./notificationController");
const { getReceiverSocketId, io } = require("../socket/socket");

//Get all books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({ sold: false }).populate(
      "seller",
      "name email address avatar createdAt"
    );
    res.status(200).send(books);
  } catch (error) {
    res.status(404).json({ message: "Books not found" }, error);
  }
};

// Get all approved books only
const getApprovedBooks = async (req, res) => {
  try {
    const books = await Book.find({ status: "Approved", sold: false }).populate(
      "seller",
      "name email address"
    );
    res.status(200).send(books);
  } catch (error) {
    res.status(404).json({ message: "Books not found", error });
  }
};

// Post a book
const postBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, genre, description, price, condition, delivery } = req.body;
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required!" });
    }
    const images = req.files.map((file) => file.filename); // Store the original file names
    const book = new Book({
      seller: userId,
      title,
      genre,
      description,
      price,
      condition,
      delivery: delivery || false,
      images: images,
    });
    const data = await book.save();

    await User.findByIdAndUpdate(userId, {
      $push: { book_listings: data._id },
    });
    res.status(200).json({ message: "Book posted successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Approve or Decline a Book
const updateBookApprovalStatus = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== "string") {
      return res
        .status(400)
        .json({ message: "Status is required and must be a string." });
    }

    const book = await Book.findById(bookId).populate("seller");

    if (!book) {
      return res.status(404).json({ message: "Book not found!" });
    }

    book.status = status;
    book.approvalDate = new Date();
    await book.save();

    const message = `Your book "${book.title}" has been ${status} by the admin.`;
    const notification = await createNotification(
      book.seller._id.toString(),
      "BOOK_APPROVAL",
      message
    );

    const receiverSocketId = getReceiverSocketId(book.seller._id.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newNotification", {
        ...notification.toObject(),
        createdAt: new Date(),
      });
    }

    res.status(200).json({
      message: `Book ${status} successfully!`,
      data: book,
    });
  } catch (error) {
    console.error("Error updating approval status:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get a book by id
const getBookById = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId).populate(
      "seller",
      "name email address avatar createdAt"
    );
    res.status(200).send(book);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get books posted by a specific user
const getBookByUser = async (req, res) => {
  try {
    const { id } = req.headers;
    const books = await Book.find({ seller: id, sold: false });
    res.status(200).send(books);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Approved books posted by a specific user
const getApprovedBookByUser = async (req, res) => {
  try {
    const { id } = req.headers;
    const books = await Book.find({ seller: id, status: "Approved" });
    res.status(200).send(books);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a book
const deleteBookById = async (req, res) => {
  try {
    const { bookid } = req.headers;
    const userId = req.user.id;

    const book = await Book.findByIdAndDelete(bookid);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { book_listings: bookid },
    });

    return res.status(200).json({ message: "Book deleted successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Update book
const updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, genre, description, price, condition, delivery } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found!" });
    }

    const updateFields = {
      title,
      genre,
      description,
      price,
      condition,
      delivery,
      status: "Pending",
    };

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.filename);
      updateFields.images = [...book.images, ...newImages];
    }

    const updatedBook = await Book.findByIdAndUpdate(bookId, updateFields, {
      new: true,
    });
    res
      .status(200)
      .json({ message: "Book updated successfully!", data: updatedBook });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

// Mark as sold
const markAsSold = async (req, res) => {
  const { bookId } = req.params;
  const sellerId = req.user.id;

  try {
    const book = await Book.findOne({ _id: bookId, seller: sellerId });

    if (!book) {
      return res
        .status(404)
        .json({ message: "Book not found or not owned by you." });
    }

    if (book.sold) {
      return res
        .status(400)
        .json({ message: "Book is already marked as sold." });
    }
    book.sold = true;
    await book.save();

    res
      .status(200)
      .json({ message: "Book marked as sold successfully!", book });
  } catch (error) {
    res.status(500).json({ message: "Error marking book as sold.", error });
  }
};

const getSoldBook = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const soldBooks = await Book.find({ seller: sellerId, sold: true });

    res.status(200).json(soldBooks);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Could not fetch sold books." });
  }
};

module.exports = {
  getAllBooks,
  getApprovedBooks,
  postBook,
  updateBookApprovalStatus,
  getBookById,
  getBookByUser,
  getApprovedBookByUser,
  deleteBookById,
  updateBook,
  markAsSold,
  getSoldBook,
};
