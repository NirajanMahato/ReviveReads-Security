const verifyCaptcha = async (req, res, next) => {
  try {
    const { captchaAnswer, correctAnswer } = req.body;

    if (!captchaAnswer) {
      return res.status(400).json({
        message: "Please solve the math problem",
      });
    }

    if (captchaAnswer !== correctAnswer) {
      return res.status(400).json({
        message: "Incorrect answer. Please try again.",
      });
    }

    delete req.body.captchaAnswer;
    delete req.body.correctAnswer;

    next();
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return res.status(500).json({
      message: "CAPTCHA verification failed. Please try again.",
    });
  }
};

module.exports = { verifyCaptcha };
