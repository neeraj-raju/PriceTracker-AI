package com.pricetracker.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPriceDropEmail(
            String toEmail,
            String productName,
            String oldPrice,
            String newPrice,
            String productUrl
    ) {
        String subject = "📉 Price Drop Alert: " + productName;
        String text = "⚡ PriceTracker AI Notification ⚡\n\n" +
                      "Great news! The price of a product you are tracking has dropped!\n\n" +
                      "📦 Product Name: " + productName + "\n" +
                      "📉 Original Price: ₹" + oldPrice + "\n" +
                      "🔥 Price after dropped: ₹" + newPrice + "\n\n" +
                      "🔗 Click here to buy now: " + productUrl + "\n\n" +
                      "Thank you for using PriceTracker AI!";

        // Log the email content to the console for verification
        log.info("\n============================================================\n" +
                 "[✉️ EMAIL ALERT GENERATED SUCCESSFULLY]\n" +
                 "To: {}\n" +
                 "Subject: {}\n" +
                 "Body:\n{}\n" +
                 "============================================================",
                 toEmail, subject, text);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
        log.info("[✉️ EMAIL SENT SECURELY VIA SMTP] Email successfully handed over to mail server.");
    }
}