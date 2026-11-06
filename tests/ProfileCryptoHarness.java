// ©️ Kevin W. Brown 2026
import java.io.BufferedReader;
import java.io.InputStreamReader;
import ca.kevin.maplewave.ProfileCrypto;
public final class ProfileCryptoHarness {
    public static void main(String[] args) throws Exception {
        BufferedReader in=new BufferedReader(new InputStreamReader(System.in,"UTF-8"));
        String text=in.readLine(),key=in.readLine(),aad=in.readLine();
        System.out.println(ProfileCrypto.seal(text,key,aad));
    }
}
