import React, { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP & Password
  const [error, setError] = useState("");
  const [secret, setSecret] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validatePassword = (password) => {
    return password.length >= 6; // Minimum 6 characters
  };
  
  const showToast = (title, description, status) => {
    setError("");
    setSuccessMessage("");
    
    if (status === "error") {
      setError(description);
    } else if (status === "success") {
      setSuccessMessage(description);
    }
    
    setTimeout(() => {
      setError("");
      setSuccessMessage("");
    }, 5000);
  };
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    
    // Client-side validation
    if (!email) {
      showToast("Error", "Please enter your email address", "error");
      setIsSubmitting(false);
      return;
    }
    
    if (!validateEmail(email)) {
      showToast("Error", "Please enter a valid email address", "error");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch('https://globalindiabackendnew.onrender.com/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSecret(data.secret);
        setCurrentStep(2);
        showToast("Success", data.message || "Password reset request sent to admin for approval", "success");
      } else {
        showToast("Error", data.error || "Failed to send reset request. Please try again.", "error");
      }
    } catch (err) {
      showToast("Network Error", "Failed to connect to server. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    
    // Client-side validation
    if (!otp || otp.length !== 6) {
      showToast("Error", "Please enter the 6-digit OTP", "error");
      setIsSubmitting(false);
      return;
    }
    
    if (!newPassword || !validatePassword(newPassword)) {
      showToast("Error", "Password must be at least 6 characters long", "error");
      setIsSubmitting(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showToast("Error", "Passwords do not match", "error");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch('https://globalindiabackendnew.onrender.com/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp, 
          newPassword, 
          secret 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast("Success", data.message || "Password has been reset successfully", "success");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = "/auth/signin";
        }, 3000);
      } else {
        showToast("Error", data.error || "Failed to reset password. Please try again.", "error");
      }
    } catch (err) {
      showToast("Network Error", "Failed to connect to server. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBackToLogin = () => {
    window.location.href = "/auth/signin";
  };
  
  const handleBackToEmail = () => {
    setCurrentStep(1);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccessMessage("");
    setSecret("");
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      minHeight: '80vh',
      padding: '20px'
    }}>
      <div style={{
        position: 'relative',
        marginTop: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '450px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          padding: '60px',
          borderRadius: '20px',
          boxShadow: '0px 5px 14px rgba(67, 55, 226, 0.05)',
          border: '1px solid #e0e0e0'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#2d3748',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '22px'
          }}>
            {currentStep === 1 ? "Forgot Password" : "Reset Password"}
          </h1>
          
          {error && (
            <div style={{
              backgroundColor: '#fed7d7',
              border: '1px solid #fc8181',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              color: '#c53030',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '8px' }}>⚠️</span>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{
              backgroundColor: '#c6f6d5',
              border: '1px solid #68d391',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              color: '#2f855a',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '8px' }}>✅</span>
              {successMessage}
            </div>
          )}

          {currentStep === 1 ? (
            <>
              <p style={{
                marginBottom: '36px',
                textAlign: 'center',
                color: '#2d3748'
              }}>
                Enter your email address and we'll send a reset request to the admin for approval.
              </p>

              <form onSubmit={handleEmailSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: 'normal',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="mail@example.com"
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '7px',
                      height: '50px',
                      padding: '12px',
                      fontSize: '16px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    background: 'linear-gradient(to right, #00c6ff, #0072ff)',
                    color: 'white',
                    padding: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Reset Request"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <p style={{
                  marginBottom: '16px',
                  textAlign: 'center',
                  color: '#2d3748'
                }}>
                  A password reset request has been sent to the admin. Once approved, enter the OTP you received and your new password.
                </p>
                
                <p style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#2d3748',
                  textAlign: 'center'
                }}>
                  Email: {email}
                </p>

                <form onSubmit={handlePasswordReset}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{
                        fontSize: '14px',
                        fontWeight: 'normal',
                        marginBottom: '8px',
                        display: 'block',
                        textAlign: 'center'
                      }}>
                        Enter 6-digit OTP
                      </label>
                      <input
                        type="text"
                        placeholder="000000"
                        maxLength="6"
                        style={{
                          border: '1px solid #e0e0e0',
                          borderRadius: '7px',
                          height: '50px',
                          padding: '12px',
                          fontSize: '24px',
                          width: '100%',
                          textAlign: 'center',
                          letterSpacing: '8px',
                          boxSizing: 'border-box'
                        }}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        fontSize: '14px',
                        fontWeight: 'normal',
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        style={{
                          border: '1px solid #e0e0e0',
                          borderRadius: '7px',
                          height: '50px',
                          padding: '12px',
                          fontSize: '16px',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        fontSize: '14px',
                        fontWeight: 'normal',
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        style={{
                          border: '1px solid #e0e0e0',
                          borderRadius: '7px',
                          height: '50px',
                          padding: '12px',
                          fontSize: '16px',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        background: 'linear-gradient(to right, #00c6ff, #0072ff)',
                        color: 'white',
                        padding: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Resetting..." : "Reset Password"}
                    </button>
                  </div>
                </form>
                
                <button
                  type="button"
                  style={{
                    border: '1px solid #0072ff',
                    background: 'transparent',
                    color: '#0072ff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onClick={handleBackToEmail}
                >
                  ← Back to Email Entry
                </button>
              </div>
            </>
          )}
          
          <div style={{
            marginTop: '32px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <button
              type="button"
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#0072ff',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onClick={handleBackToLogin}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 