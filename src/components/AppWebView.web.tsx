import React from 'react';

export default function AppWebView({ source }: { source: { uri: string } }) {
  return (
    <iframe 
      src={source.uri} 
      style={{ width: '100%', height: '100%', border: 'none' }}
      title="LRCLIB Upload"
    />
  );
}
