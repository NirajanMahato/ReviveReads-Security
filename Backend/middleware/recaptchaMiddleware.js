const verifyCaptcha = async (req, res, next) => {
  try {
    const { captchaAnswer, captchaText } = req.body;
    if (!captchaAnswer) {
      return res
        .status(400)
        .json({ message: "Please type the characters shown" });
    }
    if (captchaAnswer !== captchaText) {
      return res
        .status(400)
        .json({ message: "Incorrect characters. Please try again." });
    }
    // Remove the captcha fields from the request body as they're not needed for user creation
    delete req.body.captchaAnswer;
    delete req.body.captchaText;
    next();
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return res
      .status(500)
      .json({ message: "CAPTCHA verification failed. Please try again." });
  }
};

module.exports = { verifyCaptcha };
