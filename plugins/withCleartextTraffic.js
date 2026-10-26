const { withDangerousMod, withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const NETWORK_SECURITY_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
`;

module.exports = function withCleartextTraffic(config) {
  // 1. Create network_security_config.xml in res/xml
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const resXmlDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'xml'
      );
      if (!fs.existsSync(resXmlDir)) {
        fs.mkdirSync(resXmlDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(resXmlDir, 'network_security_config.xml'),
        NETWORK_SECURITY_CONFIG
      );
      return config;
    },
  ]);

  // 2. Set usesCleartextTraffic and networkSecurityConfig in AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    if (androidManifest.application && androidManifest.application.length > 0) {
      const app = androidManifest.application[0]['$'];
      app['android:usesCleartextTraffic'] = 'true';
      app['android:networkSecurityConfig'] = '@xml/network_security_config';
    }
    return config;
  });

  return config;
};
