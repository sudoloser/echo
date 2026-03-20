import React from 'react';
import { WebView, WebViewProps } from 'react-native-webview';

export default function AppWebView(props: WebViewProps) {
  return (
    <WebView 
      {...props} 
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );
}
