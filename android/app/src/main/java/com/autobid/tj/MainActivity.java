package com.autobid.tj;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Принудительно устанавливаем URL сервера для подключения к базе данных
        this.bridge.setServerUrl("https://autobidtj-serviceapp225.replit.app");
    }
}