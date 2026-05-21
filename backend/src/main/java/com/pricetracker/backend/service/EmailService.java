package com.pricetracker.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPriceDropEmail(
            String toEmail,
            String productName,
            String oldPrice,
            String newPrice
    ) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(toEmail);

        message.setSubject(
                "Price Dropped for " + productName
        );

        message.setText(
                "Good News!\n\n" +
                        "Price dropped for: " + productName + "\n\n" +
                        "Old Price: ₹" + oldPrice + "\n" +
                        "New Price: ₹" + newPrice + "\n\n" +
                        "Track more products soon!"
        );

        mailSender.send(message);
    }
}