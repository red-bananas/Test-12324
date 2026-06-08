const required = [{ name: 'EXPO_TOKEN', env: 'EXPO_TOKEN' }];

const optional = [
  {
    name: 'GOOGLE_PLAY_SERVICE_ACCOUNT_KEY',
    env: 'GOOGLE_PLAY_SERVICE_ACCOUNT_KEY',
    hint: 'Required unless Play submit credentials are stored on expo.dev',
  },
];

let missing = 0;

for (const secret of required) {
  if (!process.env[secret.env]) {
    console.error(`::error::Missing secret ${secret.name}`);
    missing += 1;
  }
}

for (const secret of optional) {
  if (!process.env[secret.env]) {
    console.warn(`::warning::${secret.name} not set — ${secret.hint}`);
  }
}

if (missing > 0) {
  process.exit(1);
}

console.log('Release secrets OK (EXPO_TOKEN present).');
