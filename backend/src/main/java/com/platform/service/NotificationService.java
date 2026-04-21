package com.platform.service;

import com.platform.entity.Notification;
import com.platform.entity.User;
import com.platform.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${whatsapp.api.url:}")
    private String whatsappApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void notify(User user, String title, String message) {
        if (user == null) return;
        
        // 1. Save to DB (always works)
        notificationRepository.save(Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .isRead(false)
                .build());

        // 2. Send Email to the specific user
        sendEmail(user.getEmail(), title, message);

        // 3. Send WhatsApp message to the specific user's phone
        if (user.getPhone() != null && !user.getPhone().isEmpty()) {
            sendWhatsAppMessage(user.getPhone(), title + "\n\n" + message);
        }
    }

    private void sendEmail(String toEmail, String subject, String body) {
        if (mailSender == null || fromEmail == null || fromEmail.isEmpty()) {
            System.out.println("[NOTIFICATION] Email config missing. Skipping email to: " + toEmail);
            return;
        }

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(toEmail);
            msg.setSubject("[AI Local Services] " + subject);
            msg.setText(body + "\n\n---\nAI Local Services Platform");
            mailSender.send(msg);
            System.out.println("[NOTIFICATION] ✅ Email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("[NOTIFICATION] ❌ Email failed to " + toEmail + ": " + e.getMessage());
            System.err.println("[NOTIFICATION] TIP: For Gmail, you need an App Password. Go to https://myaccount.google.com/apppasswords");
        }
    }

    private void sendWhatsAppMessage(String phone, String text) {
        if (whatsappApiUrl == null || whatsappApiUrl.isEmpty()) {
            System.out.println("[NOTIFICATION] WhatsApp service URL not configured. Skipping.");
            return;
        }

        try {
            java.net.URI uri = UriComponentsBuilder.fromHttpUrl(whatsappApiUrl)
                    .queryParam("phone", phone)
                    .queryParam("text", text)
                    .build().encode().toUri();

            String response = restTemplate.getForObject(uri, String.class);
            System.out.println("[NOTIFICATION] ✅ WhatsApp sent to " + phone + ": " + response);
        } catch (Exception e) {
            System.err.println("[NOTIFICATION] ❌ WhatsApp failed to " + phone + ": " + e.getMessage());
        }
    }
}

