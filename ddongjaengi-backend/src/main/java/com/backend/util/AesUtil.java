package com.backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class AesUtil {

    private final String alg = "AES/CBC/PKCS5Padding";
    private final SecretKeySpec keySpec;
    private final IvParameterSpec ivParamSpec;

    public AesUtil(@Value("${crypto.aes-secret-key}") String secretKey) {
        byte[] keyBytes = new byte[32];
        byte[] sourceBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        System.arraycopy(sourceBytes, 0, keyBytes, 0, Math.min(sourceBytes.length, 32));

        byte[] ivBytes = new byte[16];
        System.arraycopy(keyBytes, 0, ivBytes, 0, 16);

        this.keySpec = new SecretKeySpec(keyBytes, "AES");
        this.ivParamSpec = new IvParameterSpec(ivBytes);
    }

    public String encrypt(String text) {
        if (text == null || text.isBlank()) {
            return text;
        }
        try {
            Cipher cipher = Cipher.getInstance(alg);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivParamSpec);
            byte[] encrypted = cipher.doFinal(text.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("AES Encryption failed: " + e.getMessage(), e);
        }
    }

    public String decrypt(String cipherText) {
        if (cipherText == null || cipherText.isBlank()) {
            return cipherText;
        }
        try {
            Cipher cipher = Cipher.getInstance(alg);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, ivParamSpec);
            byte[] decodedBytes = Base64.getDecoder().decode(cipherText);
            byte[] decrypted = cipher.doFinal(decodedBytes);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("AES Decryption failed: " + e.getMessage(), e);
        }
    }
}
