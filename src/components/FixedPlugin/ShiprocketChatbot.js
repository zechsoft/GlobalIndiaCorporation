import React, { useState, useEffect, useRef } from "react";
import {
  FaComments,
  FaPaperPlane,
  FaTimes,
  FaRobot,
  FaUser,
  FaWhatsapp,
  FaEnvelope,
  FaArrowLeft,
} from "react-icons/fa";
import './Chatbot.css';  // Importing our custom CSS

const ShiprocketChatbots = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stage, setStage] = useState("info-collection");
  const [currentStep, setCurrentStep] = useState(0);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [showCloseIcon, setShowCloseIcon] = useState(false);
  const messagesEndRef = useRef(null);

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    productType: "",
    productName: "",
    price: "",
    deliveryDate: "",
    message: "",
  });

  const [messages, setMessages] = useState([
    {
      text: "👋 Welcome to Global India Corporation To get started, please enter your name:",
      sender: "bot",
    },
  ]);

  const questions = [
    {
      field: "email",
      question: "Please enter your email address:",
      validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      errorMessage: "Please enter a valid email address",
    },
    {
      field: "phone_number ",
      question: "What's your phone number ?",
      validation: (value) => value.length >= 2,
      errorMessage: "Please enter a valid phone number ",
    },
    {
      field: "product",
      question: "What product are you looking for?",
      validation: (value) => value.length >= 2,
      errorMessage: "Please enter a valid product name",
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setShowCloseIcon(false);
  };

  const handleMouseEnter = () => {
    if (!isChatOpen) {
      setShowCloseIcon(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isChatOpen) {
      setShowCloseIcon(false);
    }
  };

  const addBotMessage = (text, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { text, sender: "bot" }]);
    }, delay);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setInputMessage("");

    if (stage === "info-collection") {
      const currentQuestion = questions[currentStep];

      if (!currentQuestion.validation(userMessage)) {
        addBotMessage(currentQuestion.errorMessage);
        return;
      }

      setUserInfo((prev) => ({
        ...prev,
        [currentQuestion.field]: userMessage,
      }));

      if (currentStep < questions.length - 1) {
        setCurrentStep((prev) => prev + 1);
        addBotMessage(questions[currentStep + 1].question);
      } else {
        setStage("message");
        addBotMessage("Please provide any additional message or requirements:");
      }
    } else if (stage === "message") {
      setUserInfo((prev) => ({
        ...prev,
        message: userMessage,
      }));
      setStage("summary");
      setShowContactOptions(true);

      const summaryMessage = `Thank you for providing your details! Here's a summary:

Email: ${userInfo.email}
City: ${userInfo.phone_number }
Phone: ${userInfo.product}
Additional Message: ${userMessage}

Please choose how you would like to proceed by clicking one of the options below:`;

      addBotMessage(summaryMessage);
    }
  };

  const openWhatsApp = () => {
    const phoneNumber = "+918825430312";
    const message = `Hi, I'm interested in placing an order:
Email: ${userInfo.email}
City: ${userInfo.phone_number }
Phone: ${userInfo.product}
  Additional Message: ${userInfo.message}`;

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const sendEmail = () => {
    const subject = `New Product Inquiry from ${userInfo.name}`;
    const body = `Product Inquiry Details:
    
Name: ${userInfo.name}
Email: ${userInfo.email}
Phone: ${userInfo.phone}
City: ${userInfo.city}
Product Type: ${userInfo.productType}
Product Name: ${userInfo.productName}
Budget: ₹${userInfo.price}
Delivery Date: ${userInfo.deliveryDate}
Additional Message: ${userInfo.message}`;

    window.location.href = `mailto:mugil9451@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="chatbot-container">
      {isChatOpen && (
        <div className={`chatbot-box ${isMobile ? "mobile" : "desktop"}`}>
          <div className="chatbot-header">
            <div className="header-left">
              {isMobile && (
                <button onClick={toggleChat} className="back-button">
                  <FaArrowLeft className="back-icon" />
                </button>
              )}
              <div className="avatar">
                <FaRobot className="robot-icon" />
              </div>
              <div className="header-info">
                <h2>Global India corporation</h2>
                <div className="status">
                  <span className="status-dot"></span>
                  <p className="status-text">Online | Ready to help</p>
                </div>
              </div>
            </div>
            <button onClick={toggleChat} className="close-button">
              <FaTimes className="close-icon" />
            </button>
          </div>

          <div className="messages-area">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === "bot" ? "bot-message" : "user-message"}`}
              >
                {msg.sender === "bot" && (
                  <div className="avatar">
                    <FaRobot className="robot-icon" />
                  </div>
                )}
                <div className={`message-text ${msg.sender === "bot" ? "bot-text" : "user-text"}`}>
                  {msg.text}
                </div>
                {msg.sender === "user" && (
                  <div className="avatar">
                    <FaUser className="user-icon" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <div className="dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showContactOptions && stage === "summary" && (
            <div className="contact-options">
              <button onClick={openWhatsApp} className="whatsapp-button">
                <FaWhatsapp className="whatsapp-icon" />
                WhatsApp
              </button>
              <button onClick={sendEmail} className="email-button">
                <FaEnvelope className="email-icon" />
                Email
              </button>
            </div>
          )}

          <div className="input-area">
            <input
              type="text"
              placeholder="Type your message..."
              className="input-box"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button onClick={handleSendMessage} className="send-button">
              <FaPaperPlane className="send-icon" />
            </button>
          </div>
        </div>
      )}

      {!isChatOpen && (
        <div
          className="chat-toggle-button"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button onClick={toggleChat} className="chat-icon-button">
            <FaComments className="chat-icon" />
            {showCloseIcon && (
              <div className="close-chat">
                <FaTimes className="close-chat-icon" />
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShiprocketChatbots;
