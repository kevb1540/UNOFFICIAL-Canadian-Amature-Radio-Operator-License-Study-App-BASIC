// ©️ Kevin W. Brown 2026
package ca.kevin.maplewave;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/** Standard AES-GCM compatible with Web Crypto; synchronous lifecycle checkpoint. */
public final class ProfileCrypto {
    private ProfileCrypto() {}
    public static String seal(String text,String encodedKey,String aad) throws Exception {
        byte[] key=Base64.getDecoder().decode(encodedKey);
        if(key.length!=32 || !aad.matches("MW3:data:[a-f0-9]{32}"))throw new IllegalArgumentException("Invalid profile encryption key");
        byte[] iv=new byte[12];new SecureRandom().nextBytes(iv);
        Cipher c=Cipher.getInstance("AES/GCM/NoPadding");
        c.init(Cipher.ENCRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,iv));
        c.updateAAD(aad.getBytes(StandardCharsets.UTF_8));
        byte[] encrypted=c.doFinal(text.getBytes(StandardCharsets.UTF_8));
        java.util.Arrays.fill(key,(byte)0);
        return "{\"iv\":\""+Base64.getEncoder().encodeToString(iv)+"\",\"data\":\""+Base64.getEncoder().encodeToString(encrypted)+"\"}";
    }
}
